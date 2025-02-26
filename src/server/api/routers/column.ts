import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const columnRouter = createTRPCRouter({
    addColumn: protectedProcedure
        .input(z.object({ tableId: z.string(), name: z.string(), type: z.enum(["TEXT", "NUMBER"]) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.column.create({
                data: {
                    tableId: input.tableId,
                    name: input.name,
                    type: input.type,
                }
            })
        }),

    getColumns: protectedProcedure
        .input(z.object({ tableId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.column.findMany({
                where: { tableId: input.tableId }
            })
        })
})