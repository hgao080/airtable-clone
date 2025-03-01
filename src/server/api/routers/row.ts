import { table } from "console";
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
          })
        }

        return {
          message: `Added ${COUNT} rows`,
        }
      }),

  getRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
      });
    }),

  getRowsInfinite: protectedProcedure
    .input(z.object({ tableId: z.string(), start: z.number(), size: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.row.findMany({
        where: { tableId: input.tableId },
        include: { cells: true },
        skip: input.start,
        take: input.size,
      });
    }),
});
