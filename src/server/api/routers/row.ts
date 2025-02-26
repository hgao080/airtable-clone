import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const rowRouter = createTRPCRouter({
    addRow: protectedProcedure
        .input(z.object({ tableId: z.string(), values: z.record(z.string(), z.any()) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.row.create({
                data: {
                    tableId: input.tableId,
                    values: input.values,
                }
            })
        }),

    getRows: protectedProcedure
        .input(z.object({ tableId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.row.findMany({
                where: { tableId: input.tableId }
            })
        })
})