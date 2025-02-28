import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const tableRouter = createTRPCRouter({
    createTable: protectedProcedure
        .input(z.object({ baseId: z.string(), name: z.string()}))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.table.create({
                data: {
                    baseId: input.baseId,
                    name: input.name,
                }
            })
        }),

    getTablesByBase: protectedProcedure
        .input(z.object({ baseId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.table.findMany({
                where: { baseId: input.baseId }
            })
        })
})