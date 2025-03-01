import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import ColumnModal from "./columnModal";
import TableBody from "./tableBody";

interface TableProps {
  tableId: string;
  searchQuery: string;
}

export default function Table({ tableId, searchQuery }: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

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
        created: new Date(),
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
        created: new Date(),
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

  const addBulkRows = api.row.addBulkRows.useMutation({
    onSuccess: (data) => {
      setIsCreatingRow(false);
      console.log(data?.message);
      refetchRows();
    },
    onError: (err) => {
      setIsCreatingRow(false);
      console.error(err);
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

  const handleCreateKRows = () => {
    setIsCreatingRow(true);
    addBulkRows.mutate({
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

  const rowNumColumn: ColumnDef<any> = {
    id: "rowNum",
    header: "#",
    size: 50,
    cell: (props) => {
      return (
        <div className="pl-1 text-[0.75rem] font-light">
          {props.row.index + 1}
        </div>
      );
    },
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      rowNumColumn,
      ...(localTableColumns || []).map((col) => ({
        accessorKey: col.id,
        header: () => {
          const isMatch =
            searchQuery.length > 0 &&
            col.name.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <div
              className={`flex h-8 items-center pl-2 ${isMatch ? "bg-yellow-200" : ""}`}
            >
              {col.name}
            </div>
          );
        },
        cell: ({ row, getValue }: { row: any; getValue: () => any }) => {
          const rowId = row.original.id;
          const columnId = col.id;
          const cellValue = row.original[columnId] || "";

          const isMatch =
            searchQuery.length > 0 &&
            cellValue.toLowerCase().includes(searchQuery.toLowerCase());

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
              className={`flex h-full w-full items-center pl-1 text-[0.75rem] outline-none focus:ring-2 focus:ring-blue-500 ${
                isMatch ? "bg-yellow-200" : ""
              }`}
              onDoubleClick={() =>
                handleDoubleClick(rowId, columnId, cellValue)
              }
            >
              {cellValue}
            </div>
          );
        },
      })),
    ],

    [localTableColumns, editingCell, editValue, searchQuery],
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={tableContainerRef}
      className="h-full overflow-auto border bg-gray-50 relative"
    >
        <table className="grid">
          <thead className="grid sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="flex w-full" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    className={`relative z-50 border border-t-0 border-gray-300 bg-gray-100 pl-1 text-start text-[0.8rem] font-light`}
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

          <TableBody table={table} tableContainerRef={tableContainerRef} handleCreateRow={handleCreateRow} handleCreateKRows={handleCreateKRows} isCreating={isCreatingColumn || isCreatingRow}/>

          {/* <tfoot className="relative grid">
            <tr className="flex">
              <td className="border border-t-0 border-gray-300 pl-2 text-[1.5rem] w-[50px] text-gray-400">
                <button
                  onClick={handleCreateRow}
                  className="w-full text-start"
                  disabled={isCreatingColumn || isCreatingRow}
                >
                  +
                </button>
              </td>
              <td className="flex border border-t-0 border-gray-300 pl-2 text-[1.5rem] text-gray-400">
                <button
                  onClick={handleCreateKRows}
                  className="w-full text-start"
                  disabled={isCreatingColumn || isCreatingRow}
                >
                  Add 100k
                </button>
              </td>
            </tr>
          </tfoot> */}
        </table>
      </div>
  );
}
