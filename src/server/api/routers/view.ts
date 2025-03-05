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
        orderBy: {
          created: "asc",
        }
      });
    }),

  updateColumnVisibility: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnVisibility: z.record(z.string(), z.boolean()),
      }),
    )
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
    .input(
      z.object({
        viewId: z.string(),
        sortingState: z.array(z.object({ id: z.string(), desc: z.boolean() })),
      }),
    )
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

  updateColumnFilters: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnFilters: z.array(
          z.object({
            id: z.string(),
            value: z.object({ operator: z.string(), value: z.string() }),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.view.update({
        where: {
          id: input.viewId,
        },
        data: {
          columnFilters: input.columnFilters,
        },
      });
    }),

  createView: protectedProcedure
    .input(z.object({ tableId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: {
          tableId: input.tableId,
        },
      });
      const columnsVisibility = columns.reduce(
        (acc, column) => {
          acc[column.id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      return await ctx.db.view.create({
        data: {
          name: input.name,
          tableId: input.tableId,
          columnVisibility: columnsVisibility,
          sortingState: [],
          columnFilters: [],
        },
      });
    }),
});
