import React, { useMemo, useState } from "react";
import { api } from "~/trpc/react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Column } from "@prisma/client";

interface TableProps {
  tableId: string;
}

export default function Table({ tableId }: TableProps) {
  const { data: tableColumns, refetch: refetchColumns } =
    api.column.getColumns.useQuery({
      tableId,
    });
  const { data: tableRows, refetch: refetchRows } = api.row.getRows.useQuery({
    tableId,
  });

  const createColumn = api.column.addColumn.useMutation({
    onSuccess: () => refetchColumns(),
  });
  const createRow = api.row.addRow.useMutation({
    onSuccess: () => refetchRows(),
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      (tableColumns || []).map((col: Column) => ({
        accessorKey: col.id,
        header: () => <div className="">{col.name}</div>,
        cell: ({ row, getValue }) => {
          const rowData = row.original;
          const cellValue = getValue() as string | number | undefined;

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedValues = {
              ...rowData.values,
              [col.id]: e.target.value,
            };
            // REPLACE LATER WITH UPDATE CALL
            console.log(updatedValues);
          };

          return (
            <input type="text" value={cellValue} onChange={handleChange} />
          );
        },
      })),
    [tableColumns],
  );

  const tableData = useMemo(() => {
    if (!tableRows || !tableColumns) return [];
    return tableRows.map((row) => {
      const mappedRow: Record<string, any> = { ...row, id: row.id };
      tableColumns.forEach((col) => {
        if (row.values && typeof row.values === "object") {
          mappedRow[col.id] = (row.values as Record<string, any>)[col.id] || "";
        } else {
          mappedRow[col.id] = "";
        }
      });
      return mappedRow;
    });
  }, [tableRows, tableColumns]);

  const extendedColumns: ColumnDef<any>[] = useMemo(() => {
    return [
      ...columns,
      {
        id: "addColumn",
        header: () => (
          <div className="">
            <button
              className=""
              onClick={() => {
                const name = prompt("Enter column name", "New Column");
                if (!name) {
                  return;
                }
                createColumn.mutate({ tableId, name, type: "TEXT" });
              }}
            >
              +
            </button>
          </div>
        ),
        cell: () => null,
      },
    ];
  }, [columns, createColumn, tableId]);

  const table = useReactTable({
    data: tableData,
    columns: extendedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border min-w-[2rem]">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td
              colSpan={extendedColumns.length}
              className="border p-2 text-center"
            >
              <button
                className="px-2 py-1 text-xl text-gray-600 hover:text-blue-600"
                title="Add Row"
                onClick={() =>
                  createRow.mutate({
                    tableId,
                    values: {},
                  })
                }
              >
                +
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
