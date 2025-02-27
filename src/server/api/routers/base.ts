import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const baseRouter = createTRPCRouter({
    createBase: protectedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.base.create({
                data: {
                    name: input.name,
                    user: { connect: { id: ctx.session.user.id } },
                },
            });
        }),

    getBases: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.base.findMany({
            where: { userId: ctx.session.user.id },
        })
    }),

    getBase: protectedProcedure
        .input(z.object({ baseId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.base.findFirst({
                where: { id: input.baseId, userId: ctx.session.user.id },
            })
        })
})