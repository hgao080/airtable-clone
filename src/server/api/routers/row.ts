import { Cell, Row } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { table } from "console";

interface ColumnFilterValue {
  operator: string;
  value: string;
}

interface Filter {
  id: string;
  value: ColumnFilterValue;
}

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
      const COUNT = 100000;
      const CHUNK_SIZE = 500;
      const CHUNK_CONCURRENCY = 10;

      const promises = []

      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      for (let offset = 0; offset < COUNT; offset += CHUNK_SIZE) {
        const chunkCount = Math.min(CHUNK_SIZE, COUNT - offset);

        const rowData = Array.from({ length: chunkCount }, () => ({
          id: uuidv4(),
          tableId: input.tableId,
        }));

        const cellData = rowData.flatMap((row) => 
          columns.map((col) => ({
            value: "",
            columnId: col.id,
            rowId: row.id,
          }))
        )

        promises.push(ctx.db.$transaction([
          ctx.db.row.createMany({ data: rowData }),
          ctx.db.cell.createMany({ data: cellData }),
        ]))

        if (promises.length >= CHUNK_CONCURRENCY) {
          await Promise.all(promises);
          promises.length = 0;
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      return {
        message: `Added ${COUNT} rows`,
      };
    }),

  getRows: protectedProcedure
    .input(
      z.object({ tableId: z.string(), start: z.number(), size: z.number(), view: z.object({ id: z.string(), columnFilters: z.array(z.any()), sortingState: z.array(z.any()) }) }),
    )
    .query(async ({ ctx, input }) => {
      let rows = await ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
      });

      const columnFilters = input.view.columnFilters as Filter[];
      const sorting = input.view.sortingState as { id: string; desc: boolean }[];

      if (columnFilters && columnFilters.length > 0) {
        rows = rows.filter((row) => {
          for (const filter of columnFilters) {
            if (!filter) {
              return true;
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
                return cell.value == "";
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

      if (sorting && sorting.length > 0) {
        rows = rows.sort((a, b) => {
          for (const sort of sorting) {
            const cellA = a.cells.find(
              (cell: Cell) => cell.columnId === sort.id,
            );
            const cellB = b.cells.find(
              (cell: Cell) => cell.columnId === sort.id,
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
              return sort.desc ? 1 : -1;
            } else if (valueA > valueB) {
              return sort.desc ? -1 : 1;
            }
          }

          return 0;
        });
      }

      return {
        data: rows.slice(input.start, input.start + input.size),
        meta: {
          totalRowCount: rows.length,
        },
      };
    }),

  getRowsOptimised: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        start: z.number(),
        size: z.number(),
        view: z.object({
          id: z.string(),
          columnFilters: z.array(z.any()),
          sortingState: z.array(z.any()),
        })
      })
    )
    .query(async ({ ctx, input }) => {
      const { tableId, start, size, view } = input;
      const { columnFilters, sortingState } = view;

      const filterConditions = columnFilters.map((filter) => {
        if (!filter) return {};

        const { id, value } = filter
        const { operator, value: filterValue } = value;

        const filterCondition = (() => {
          switch (operator) {
            case "contains":
              return { value: { contains: filterValue } };
            case "not_contains":
              return { NOT: { value: { contains: filterValue } } };
            case "equals":
              return { value: filterValue };
            case "is_empty":
              return { value: "" };
            case "is_not_empty":
              return { NOT: { value: "" } };
            case "greater_than":
              return { value: { gt: Number(filterValue) } };
            case "less_than":
              return { value: { lt: Number(filterValue) } };
            default:
              return {};            
          }
        })();

        return {
          cells: {
            some: {
              columnId: id,
              ...filterCondition,
            }
          }
        }
      })

      let rows = await ctx.db.row.findMany({
        where: {
          tableId,
          AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
        include: { cells: true },
        skip: start,
        take: size,
      })

      if (sortingState && sortingState.length > 0) {
        rows = rows.sort((a, b) => {
          for (const sort of sortingState) {
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
        })
      }


      const totalRowCount = await ctx.db.row.count({
        where: {
          tableId,
          AND: filterConditions.length > 0 ? filterConditions : undefined,
        }
      })

      return {
        data: rows,
        meta: {
          totalRowCount,
        }
      }
    })
});
