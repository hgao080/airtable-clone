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

  getRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
      });
    }),
});
