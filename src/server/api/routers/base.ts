import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const baseRouter = createTRPCRouter({
    createBase: protectedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const base = await ctx.db.base.create({
                data: {
                    name: input.name,
                    user: { connect: { id: userId }},
                },
            });

            return ctx.db.$transaction(async (prisma) => {
                const table = await prisma.table.create({
                    data: {
                        name: "Table 1",
                        baseId: base.id,
                    },
                })

                await prisma.view.create({
                    data: {
                        name: "Grid View",
                        tableId: table.id,
                        columnVisibility: {}
                    }
                })

                const defaultColumns = ["Name", "Notes", "Assignee", "Status"];
                const columns = await Promise.all(defaultColumns.map((colName) => {
                    return prisma.column.create({
                        data: {
                            name: colName,
                            type: "TEXT",
                            tableId: table.id
                        }
                    })
                }))

                const rows = await Promise.all(Array.from({ length: 3 }).map(() => {
                    return prisma.row.create({
                        data: {
                            tableId: table.id,
                        }
                    })
                }))

                await Promise.all(
                    rows.flatMap((row) =>
                      columns.map((column) =>
                        prisma.cell.create({
                          data: {
                            value: "",
                            columnId: column.id,
                            rowId: row.id,
                          },
                        })
                      )
                    )
                  );

                return base;
            })
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