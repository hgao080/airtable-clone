import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const columnRouter = createTRPCRouter({
  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string(),
        type: z.enum(["TEXT", "NUMBER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (prisma) => {
        const newColumn = await prisma.column.create({
          data: {
            name: input.name,
            type: input.type,
            tableId: input.tableId,
          },
        });

        const rows = await prisma.row.findMany({
          where: { tableId: input.tableId },
        });

        const newCells = rows.map((row) => ({
          value: "",
          columnId: newColumn.id,
          rowId: row.id,
        }));

        await prisma.cell.createMany({ data: newCells });

        const views = await prisma.view.findMany({
          where: { tableId: input.tableId },
        });

        for (const view of views) {
          const updatedColumnVisibility = {
            ...(typeof view.columnVisibility === 'object' && view.columnVisibility !== null ? view.columnVisibility : {}),
            [newColumn.id]: true,
          };
      
          await prisma.view.update({
            where: { id: view.id },
            data: {
              columnVisibility: updatedColumnVisibility,
            },
          });
        }

        return prisma.column.findFirst({
          where: { id: newColumn.id },
          include: { cells: true },
        });
      });
    }),

  getColumns: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.column.findMany({
        where: { tableId: input.tableId },
        orderBy: { created: "asc" },
      });
    }),

  getVisibleColumns: protectedProcedure
    .input(z.object({ tableId: z.string(), columnVisibility: z.record(z.string(), z.boolean()) }))
    .query(async ({ ctx, input }) => {

      const visibleColumnIds = Object.keys(input.columnVisibility).filter((key) => input.columnVisibility[key]);

      if (visibleColumnIds.length === 0) {
        return [];
      }

      return ctx.db.column.findMany({
        where: {
          tableId: input.tableId,
          id: {
            in: visibleColumnIds,
          }
        },
        orderBy: { created: "asc" },
      })
    }),
});
