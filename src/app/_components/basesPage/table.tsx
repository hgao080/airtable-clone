import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { set } from "zod";
import ColumnModal from "../dashboard/columnModal";

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

  // LOCAL STATE
  const [localTableColumns, setLocalTableColumns] = useState(
    tableColumns || [],
  );
  const [localTableRows, setLocalTableRows] = useState(tableRows || []);

  const [showColumnModal, setShowColumnModal] = useState(false);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isCreatingRow, setIsCreatingRow] = useState(false);

  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState<"TEXT" | "NUMBER">("TEXT");

  useEffect(() => {
    if (tableRows) {
      setLocalTableRows(tableRows);
    }
  }, [tableRows]);

  useEffect(() => {
    if (tableColumns) {
      setLocalTableColumns(tableColumns);
    }
  }, [tableColumns]);

  const createColumn = api.column.addColumn.useMutation({
    onMutate: async (newColumn) => {
      const previousColumns = localTableColumns;

      const tempId = `temp-col-${Date.now()}`;

      const placeholderColumn = {
        id: tempId,
        tableId: tableId,
        name: newColumn.name,
        type: newColumn.type,
      };

      setLocalTableColumns((prevColumns) => [
        ...prevColumns,
        placeholderColumn,
      ]);
      setLocalTableRows((prevRows) =>
        prevRows.map((row) => ({
          ...row,
          cells: [
            ...row.cells,
            {
              value: "",
              id: `temp-cell-${row.id}`,
              columnId: tempId,
              rowId: row.id,
            },
          ],
        })),
      );

      return { previousColumns, tempId };
    },
    onError: (err, newColumn, context) => {
      setIsCreatingColumn(false);

      if (context?.previousColumns) {
        setLocalTableColumns(context.previousColumns);
      }
    },
    onSuccess: (createdColumn, newColumn, context) => {
      setIsCreatingColumn(false);

      if (!createdColumn) {
        return;
      }

      setLocalTableColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === context?.tempId ? { ...col, id: createdColumn.id } : col,
        ),
      );
      setLocalTableRows((prevRows) =>
        prevRows.map((row) => ({
          ...row,
          cells: row.cells.map((cell) => ({
            ...cell,
            columnId:
              cell.columnId === context?.tempId
                ? createdColumn.id
                : cell.columnId,
          })),
        })),
      );
      refetchColumns();
    },
  });

  const createRow = api.row.addRow.useMutation({
    onMutate: async () => {
      const previousRows = localTableRows;

      const tempId = `temp-row-${Date.now()}`;
      const placeholderRow = {
        id: tempId,
        tableId: tableId,
        cells: localTableColumns.map((column) => ({
          value: "",
          id: `temp-cell-${column.id}`,
          columnId: column.id,
          rowId: tempId,
        })),
      };

      setLocalTableRows((prevRows) => [...prevRows, placeholderRow]);

      return { previousRows, tempId };
    },
    onError: (err, data, context) => {
      setIsCreatingRow(false);

      if (context?.previousRows) {
        setLocalTableRows(context.previousRows);
      }
    },
    onSuccess: (createdRow, data, context) => {
      setIsCreatingRow(false);

      if (!createdRow) {
        return;
      }
      setLocalTableRows((prevRows) =>
        prevRows.map((row) =>
          row.id === context?.tempId
            ? { ...row, id: createdRow.id, cells: createdRow.cells }
            : row,
        ),
      );
      refetchRows();
    },
  });

  const updateCell = api.cell.updateCell.useMutation({
    onMutate: async (updatedCell) => {
      setLocalTableRows((prevRows) => {
        return prevRows.map((row) =>
          row.id === updatedCell.rowId
            ? {
                ...row,
                cells: row.cells.map((cell) =>
                  cell.columnId === updatedCell.columnId
                    ? { ...cell, value: updatedCell.value }
                    : cell,
                ),
              }
            : row,
        );
      });

      return;
    },
    onError: (err, updatedCell) => {
      setLocalTableRows(localTableRows);
    },
  });

  const handleCreateColumn = () => {
    setIsCreatingColumn(true);
    if (!columnName) {
      createColumn.mutate({
        tableId,
        name: "Label " + (tableColumns?.length || 0),
        type: columnType,
      });
    } else {
      createColumn.mutate({
        tableId,
        name: columnName,
        type: columnType,
      });
    }

    handleCloseColumnModal();
  };

  const handleCreateRow = () => {
    setIsCreatingRow(true);
    createRow.mutate({
      tableId,
    });
  };

  const handleOpenColumnModal = () => {
    setShowColumnModal(true);
  };

  const handleCloseColumnModal = () => {
    setShowColumnModal(false);
    setColumnName("");
    setColumnType("TEXT");
  };

  // CELL SELECTION
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDoubleClick = (
    rowId: string,
    columnId: string,
    value: string,
  ) => {
    if (rowId.startsWith("temp-") || columnId.startsWith("temp-")) {
      return;
    }

    setEditingCell({ rowId, columnId });
    setEditValue(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    if (editingCell) {
      updateCell.mutate({
        rowId: editingCell.rowId,
        columnId: editingCell.columnId,
        value: editValue,
      });
    }
    setEditingCell(null);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      (localTableColumns || []).map((col) => ({
        accessorKey: col.id,
        header: col.name,
        cell: ({ row }) => {
          const rowId = row.original.id;
          const columnId = col.id;
          const cellValue = row.original[columnId] || "";

          return editingCell?.rowId === rowId &&
            editingCell?.columnId === columnId ? (
            <input
              type={col.type === "NUMBER" ? "number" : "text"}
              className="h-8 w-full p-1 text-[0.75rem] outline-blue-500"
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <div
              tabIndex={0}
              className={`flex h-8 w-full items-center pl-1 text-[0.75rem] focus:ring-2 focus:ring-blue-500 outline-none`}
              onDoubleClick={() =>
                handleDoubleClick(rowId, columnId, cellValue)
              }
            >
              {cellValue}
            </div>
          );
        },
      })),
    [localTableColumns, editingCell, editValue],
  );

  const data = useMemo(
    () =>
      localTableRows.map((row) => {
        const rowData: Record<string, string> = {};
        row.cells.forEach((cell) => {
          rowData[cell.columnId] = cell.value;
        });
        return { id: row.id, ...rowData };
      }),
    [localTableRows],
  );

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <div className="flex flex-auto bg-gray-50">
      <div className="">
        <table width={table.getTotalSize()} className="">
          <thead className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={`relative border border-t-0 border-gray-300 bg-gray-100 py-1 pl-3 text-start text-[0.8rem] font-light`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-[-2px] top-[3px] z-50 h-[80%] w-[3px] cursor-ew-resize rounded-full bg-blue-500 opacity-0 hover:opacity-100`}
                    ></div>
                  </th>
                ))}
                <th className="relative border border-t-0 border-gray-300 bg-gray-100">
                  <button
                    onClick={handleOpenColumnModal}
                    className="my-[-5px] w-full px-10 py-0 text-[1.5rem] font-light text-gray-500"
                    disabled={isCreatingColumn || isCreatingRow}
                  >
                    +
                  </button>
                  {showColumnModal && (
                    <ColumnModal
                      columnName={columnName}
                      columnType={columnType}
                      setColumnName={setColumnName}
                      setColumnType={setColumnType}
                      handleCloseColumnModal={handleCloseColumnModal}
                      handleModalCreateColumn={handleCreateColumn}
                    />
                  )}
                </th>
              </tr>
            ))}
          </thead>

          <tbody className="bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="h-8">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className={`border border-gray-300`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="">
              <td className="border border-t-0 border-gray-300 pl-2 text-[1.5rem] text-gray-400">
                <button
                  onClick={handleCreateRow}
                  className="w-full text-start"
                  disabled={isCreatingColumn || isCreatingRow}
                >
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
