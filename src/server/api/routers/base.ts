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
    })
})