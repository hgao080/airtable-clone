import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(z.object({ baseId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (prisma) => {
        const newTable = await prisma.table.create({
          data: {
            baseId: input.baseId,
            name: input.name,
          },
        });

        const defaultColumns = ["Name", "Notes", "Assignee", "Status"];
        const columns = await Promise.all(
          defaultColumns.map((colName) => {
            return prisma.column.create({
              data: {
                name: colName,
                type: "TEXT",
                tableId: newTable.id,
              },
            });
          }),
        );

        const columnsVisibility = columns.reduce((acc, column) => {
          acc[column.id] = true;
          return acc;
        }, {} as Record<string, boolean>)

        await prisma.view.create({
          data: {
            name: "Grid View",
            tableId: newTable.id,
            columnVisibility: columnsVisibility,
            sortingState: [],
            columnFilters: [],
          },
        })

        const rows = await Promise.all(
          Array.from({ length: 3 }).map(() => {
            return prisma.row.create({
              data: {
                tableId: newTable.id,
              },
            });
          }),
        );

        await Promise.all(
          rows.flatMap((row) =>
            columns.map((column) =>
              prisma.cell.create({
                data: {
                  value: "",
                  columnId: column.id,
                  rowId: row.id,
                },
              }),
            ),
          ),
        );

        return newTable;
      });
    }),

  getTable: protectedProcedure
    .input(z.object({ tableId: z.union([z.string(), z.undefined()]) }))
    .query(async ({ ctx, input }) => {
        if (!input.tableId) {
            return {
              columns: []
            };
        }

      return ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: { columns: {
          orderBy: {
            created: 'asc'
          }
        } },
      });
    }),

  getTablesByBase: protectedProcedure
    .input(z.object({ baseId: z.union([z.string(), z.null()]) }))
    .query(async ({ ctx, input }) => {
      if (!input.baseId) {
        return [];
      }

      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
      });
    }),
});
