import { Cell } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const rowRouter = createTRPCRouter({
  addRow: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (prisma) => {
        const newRow = await prisma.row.create({
          data: {
            tableId: input.tableId,
          },
        });

        const columns = await prisma.column.findMany({
          where: { tableId: input.tableId },
        });

        const newCells = columns.map((column) => ({
          value: "",
          columnId: column.id,
          rowId: newRow.id,
        }));

        await prisma.cell.createMany({ data: newCells });

        return prisma.row.findUnique({
          where: { id: newRow.id },
          include: { cells: true },
        });
      });
    }),

  addBulkRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const COUNT = 1000;
      const CHUNK_SIZE = 500;

      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      for (let offset = 0; offset < COUNT; offset += CHUNK_SIZE) {
        const chunkCount = Math.min(CHUNK_SIZE, COUNT - offset);

        const rowData = Array.from({ length: chunkCount }, () => ({
          tableId: input.tableId,
        }));

        await ctx.db.$transaction(async (prisma) => {
          await prisma.row.createMany({ data: rowData });

          const newRows = await prisma.row.findMany({
            where: { tableId: input.tableId },
            select: { id: true },
            orderBy: { created: "desc" },
            take: chunkCount,
          });

          for (const column of columns) {
            const cellData = newRows.map((row) => ({
              value: "",
              columnId: column.id,
              rowId: row.id,
            }));

            await prisma.cell.createMany({ data: cellData });
          }
        });
      }

      return {
        message: `Added ${COUNT} rows`,
      };
    }),

  getRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
      });
    }),

  getRowsFilteredSorted: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        viewId: z.string(),
        start: z.number(),
        size: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { id: input.viewId },
      });

      if (!view) {
        return {
          data: [],
          meta: {
            totalRowCount: 0,
          },
        };
      }

      const rows = await ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
      });

      let filteredSortedRows: any[] = rows;
      if (view.columnFilters.length > 0) {
        filteredSortedRows = rows.filter((row) => {
          for (const filter of view.columnFilters) {
            if (!filter) {
              return false;
            }

            const cell = row.cells.find(
              (cell) => cell.columnId === (filter as any).id,
            );

            if (!cell) {
              return false;
            }

            const filterValue = filter as {
              value: { operator: string; value: string };
            };

            switch (filterValue.value.operator) {
              case "contains":
                if (!filterValue.value.value) {
                  return true;
                }

                if (!cell.value.includes(filterValue.value.value)) {
                  return false;
                }
                break;
              case "not_contains":
                if (!filterValue.value.value) {
                  return true;
                }

                if (cell.value.includes(filterValue.value.value)) {
                  return false;
                }
                break;
              case "equals":
                if (!filterValue.value.value) {
                  return true;
                }

                if (cell.value !== filterValue.value.value) {
                  return false;
                }
                break;
              case "is_empty":
                if (cell.value !== "") {
                  return false;
                }
                break;
              case "is_not_empty":
                if (cell.value === "") {
                  return false;
                }
                break;
              case "greater_than":
                if (Number(cell.value) <= Number(filterValue.value.value)) {
                  return false;
                }
                break;
              case "less_than":
                if (Number(cell.value) >= Number(filterValue.value.value)) {
                  return false;
                }
                break;
              default:
                break;
            }
          }

          return true;
        });
      }

      if (view.sortingState.length > 0) {
        filteredSortedRows = filteredSortedRows.sort((a, b) => {
          for (const sort of view.sortingState) {
            const sortValue = sort as { id: string; desc: boolean };
            const cellA = a.cells.find(
              (cell: Cell) => cell.columnId === sortValue.id,
            );
            const cellB = b.cells.find(
              (cell: Cell) => cell.columnId === sortValue.id,
            );

            if (!cellA || !cellB) {
              continue;
            }

            const valueA = isNaN(Number(cellA.value))
              ? cellA.value
              : Number(cellA.value);
            const valueB = isNaN(Number(cellB.value))
              ? cellB.value
              : Number(cellB.value);

            if (valueA < valueB) {
              return sortValue.desc ? 1 : -1;
            } else if (valueA > valueB) {
              return sortValue.desc ? -1 : 1;
            }
          }

          return 0;
        });
      }

      return {
        data: filteredSortedRows.slice(input.start, input.start + input.size),
        meta: {
          totalRowCount: filteredSortedRows.length,
        },
      };
    }),
});
