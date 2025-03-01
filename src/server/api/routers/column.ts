import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const columnRouter = createTRPCRouter({
    addColumn: protectedProcedure
        .input(z.object({ tableId: z.string(), name: z.string(), type: z.enum(["TEXT", "NUMBER"]) }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.$transaction(async (prisma) => {
                const newColumn = await prisma.column.create({
                    data: {
                        name: input.name,
                        type: input.type,
                        tableId: input.tableId,
                    }
                })

                const rows = await prisma.row.findMany({
                    where: { tableId: input.tableId }
                })

                const newCells = rows.map((row) => (
                    {
                        value: "",
                        columnId: newColumn.id,
                        rowId: row.id,
                    }
                ))

                await prisma.cell.createMany({ data: newCells })

                return prisma.column.findFirst({
                    where: { id: newColumn.id },
                })
            })
        }),

    getColumns: protectedProcedure
        .input(z.object({ tableId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.column.findMany({
                where: { tableId: input.tableId },
                orderBy: { created: "asc" }
            })
        })
})