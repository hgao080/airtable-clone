import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  RowData,
  FilterFn,
} from "@tanstack/react-table";
import ColumnModal from "./columnModal";
import TableBody from "./tableBody";
import Filter from "./filter";
import { FaOldRepublic } from "react-icons/fa6";

interface TableProps {
  tableId: string;
  searchQuery: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (newColumnFilters: any) => void;
  columnVisibility: Record<string, boolean>;
}

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range";
  }
}

export default function Table({
  tableId,
  searchQuery,
  sorting,
  columnFilters,
  setColumnFilters,
  columnVisibility,
}: TableProps) {
  const { data: tableColumns, refetch: refetchColumns } =
    api.column.getColumns.useQuery({
      tableId,
    });
  const { data: tableRows, refetch: refetchRows } = api.row.getRows.useQuery({
    tableId,
  });

  // LOCAL STATE
  const [localTableColumns, setLocalTableColumns] = useState(
    tableColumns ?? [],
  );
  const [localTableRows, setLocalTableRows] = useState(tableRows ?? []);

  const [showColumnModal, setShowColumnModal] = useState(false);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isCreatingRow, setIsCreatingRow] = useState(false);

  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState<"TEXT" | "NUMBER">("TEXT");

  // CELL SELECTION
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

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

      void refetchRows();
      void refetchColumns();
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
      void refetchRows();
    },
  });

  const addBulkRows = api.row.addBulkRows.useMutation({
    onSuccess: (data) => {
      setIsCreatingRow(false);
      console.log(data?.message);
      void refetchRows();
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
    onError: () => {
      setLocalTableRows(localTableRows);
      return;
    },
  });

  const handleCreateColumn = () => {
    setIsCreatingColumn(true);

    if (!columnName) {
      createColumn.mutate({
        tableId,
        name: "Label " + (tableColumns?.length ?? 0),
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

  const textFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId)?.toString().toLowerCase() ?? "";

    switch (filterValue.operator) {
      case "contains":
        return cellValue.includes(filterValue.value.toLowerCase())
      case "not_contains":
        if (filterValue.value === "") {
          return true;
        }
        return !cellValue.includes(filterValue.value.toLowerCase())
      case "equals":
        return cellValue === filterValue.value.toLowerCase();
      case "is_empty":
        return cellValue.trim() === "";
      case "is_not_empty":
        return cellValue.trim() !== "";
      default:
        return true;
    }
  }

  const numberFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const cellValue = Number(row.getValue(columnId));

    if (isNaN(cellValue)) {
      return false;
    }

    switch (filterValue.operator) {
      case "greater_than":
        return cellValue > Number(filterValue.value);
      case "less_than":
        return cellValue < Number(filterValue.value);
      default:
        return true;
    }
  }

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
              className={`flex h-8 w-full items-center pl-2 ${isMatch ? "bg-yellow-200" : ""}`}
            >
              {col.name}
            </div>
          );
        },
        cell: ({ row }: { row: any }) => {
          const rowId = row.original.id;
          const columnId = col.id;
          const cellValue = row.original[columnId] || "";

          const isMatch =
            searchQuery.length > 0 &&
            cellValue
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

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
              className={`flex h-full w-full flex-auto items-center pl-1 text-[0.75rem] outline-none focus:ring-2 focus:ring-blue-500 ${
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
        sortingFn: "alphanumeric" as const,
        sortUndefined: "last" as const,
        meta: {
          filterVariant:
            col.type === "NUMBER" ? ("range" as const) : ("text" as const),
        },
        filterFn: col.type === "NUMBER" ? numberFilter : textFilter,
      })),
    ],

    [localTableColumns, editingCell, editValue, searchQuery],
  );

  const data = useMemo(
    () =>
      localTableRows.map((row) => {
        const rowData: Record<string, any> = {};

        row.cells.forEach((cell) => {
          const columnDef = localTableColumns.find(
            (col) => col.id === cell.columnId,
          );
          rowData[cell.columnId] = columnDef?.type === "NUMBER" ? Number(cell.value) : cell.value;
        });
        return { id: row.id, ...rowData };
      }),
    [localTableRows],
  );

  const table = useReactTable({
    data: data,
    columns: columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
    },
    isMultiSortEvent: (e) => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  if (!tableColumns || !tableRows || tableId === "temp") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[0.75rem] text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="relative h-full overflow-auto border bg-gray-50"
    >
      <table className="grid">
        <thead className="sticky top-0 z-10 grid">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="flex w-full" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={`relative flex flex-col border border-t-0 border-gray-300 bg-gray-100 text-[0.8rem] font-light`}
                >
                  <div
                    {...{
                      className: header.column.getCanSort()
                        ? "flex flex-col cursor-pointer select-none gap-1"
                        : "",
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: "🔼",
                        desc: "🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>

                    
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-[-2px] top-[3px] z-50 h-[80%] w-[3px] cursor-ew-resize rounded-full bg-blue-500 opacity-0 hover:opacity-100`}
                    ></div>
                  </div>
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

        <TableBody
          table={table}
          tableContainerRef={tableContainerRef}
          handleCreateRow={handleCreateRow}
          handleCreateKRows={handleCreateKRows}
          isCreating={isCreatingColumn || isCreatingRow}
        />
      </table>
    </div>
  );
}
