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

        return {
          ...newRow,
          cells: newCells
        }
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
        message: `Added ${COUNT} rows. Please refresh the page to see the changes.`,
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
        orderBy: {
          created: "asc"
        },
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
