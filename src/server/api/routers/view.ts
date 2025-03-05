import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const viewRouter = createTRPCRouter({
  getViewsByTable: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.view.findMany({
        where: {
          tableId: input.tableId,
        },
      });
    }),

    updateColumnVisibility: protectedProcedure
    .input(z.object({ viewId: z.string(), columnVisibility: z.record(z.string(), z.boolean()) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.view.update({
        where: {
          id: input.viewId,
        },
        data: {
          columnVisibility: input.columnVisibility,
        },
      });
    }),

    updateSortingState: protectedProcedure
      .input(z.object({ viewId: z.string(), sortingState: z.array(z.object({ id: z.string(), desc: z.boolean() })) }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.db.view.update({
          where: {
            id: input.viewId,
          },
          data: {
            sortingState: input.sortingState,
          },
        });
      }),
})