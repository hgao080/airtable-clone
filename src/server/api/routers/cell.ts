import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cellRouter = createTRPCRouter({
  updateCell: protectedProcedure
    .input(z.object({
      rowId: z.string(),
      columnId: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result =  await ctx.db.cell.updateMany({
        where: {
          rowId: input.rowId,
          columnId: input.columnId,
        },
        data: {
          value: input.value,
        }
      })

      if (result.count === 0) {
        throw new Error("Cell not found")
      }

      return result;
    })
})