import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import ColumnModal from "./columnModal";
import TableBody from "./tableBody";
import { Cell } from "@prisma/client";

interface TableProps {
  tableId: string;
  selectedView: string;
  searchQuery: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (newColumnFilters: any) => void;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (newColumnVisibility: Record<string, boolean>) => void;
  setLocalToolBarColumns: (newColumns: any[]) => void;
  localTableColumns: any[];
  setLocalTableColumns: (newColumns: any[]) => void;
  localTableRows: any[];
  setLocalTableRows: (newRows: any[]) => void;
  fetchNextPage: () => void;
  isFetching: boolean;
  isLoading: boolean;
  dataInfinite: any;
  refetchRows: () => void;
}

export default function Table({
  tableId,
  selectedView,
  searchQuery,
  sorting,
  columnFilters,
  columnVisibility,
  setColumnVisibility,
  setLocalToolBarColumns,
  localTableColumns,
  setLocalTableColumns,
  localTableRows,
  setLocalTableRows,
  fetchNextPage,
  isFetching,
  isLoading,
  dataInfinite,
  refetchRows,
}: TableProps) {
  const queryClient = useQueryClient();

  const [showColumnModal, setShowColumnModal] = useState(false);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isCreatingRow, setIsCreatingRow] = useState(false);

  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState<"TEXT" | "NUMBER">("TEXT");

  const updateColumnVisibility = api.view.updateColumnVisibility.useMutation();

  const createColumn = api.column.addColumn.useMutation({
    onMutate: async (newColumn) => {
      setIsCreatingColumn(true);
      const previousColumns = localTableColumns;

      const tempId = `temp-col-${Date.now()}`;

      const placeholderColumn = {
        id: tempId,
        tableId: tableId,
        name: newColumn.name,
        type: newColumn.type,
        created: new Date(),
      };

      setColumnVisibility({
        ...columnVisibility,
        [tempId]: true,
      });

      setLocalToolBarColumns([...localTableColumns, placeholderColumn]);

      setLocalTableColumns([...localTableColumns, placeholderColumn]);

      setLocalTableRows([
        ...localTableRows.map((row) => ({
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
      ]);

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
        throw new Error("Column not created");
      }

      updateColumnVisibility.mutate({
        viewId: selectedView,
        columnVisibility: {
          ...columnVisibility,
          [createdColumn.id]: true,
        },
      });

      setColumnVisibility({
        ...Object.fromEntries(
          Object.entries(columnVisibility).filter(
            ([key]) => key !== context?.tempId,
          ),
        ),
        [createdColumn.id]: true,
      });

      setLocalToolBarColumns([
        ...localTableColumns.filter((col) => col.id !== context?.tempId),
        createdColumn,
      ]);

      setLocalTableColumns([
        ...localTableColumns.filter((col) => col.id !== context?.tempId),
        createdColumn,
      ]);

      setLocalTableRows([
        ...localTableRows.map((row) => ({
          ...row,
          cells: [
            ...row.cells.map((cell: Cell) => {
              if (cell.columnId === context?.tempId) {
                return {
                  value: "",
                  id: createdColumn.cells.find((c) => c.rowId === row.id)?.id,
                  columnId: createdColumn.id,
                  rowId: row.id,
                };
              }
              return cell;
            }),
          ],
        })),
      ]);

      setIsCreatingColumn(false);
    },
  });

  const createRow = api.row.addRow.useMutation({
    onMutate: () => {
      setIsCreatingRow(true);
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

      setLocalTableRows([...localTableRows, placeholderRow]);

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

      setLocalTableRows([
        ...localTableRows.filter((row) => row.id !== context?.tempId),
        createdRow,
      ]);
    },
  });

  const addBulkRows = api.row.addBulkRows.useMutation({
    onError: (err) => {
      setIsCreatingRow(false);
      console.error(err);
    },
    onSuccess: (data) => {
      setIsCreatingRow(false);
      console.log(data?.message);
      void refetchRows();
    },
  });

  const updateCell = api.cell.updateCell.useMutation({
    onMutate: async (updatedCell) => {
      await queryClient.cancelQueries({
        queryKey: ["rows", tableId],
      });

      const previousRows = queryClient.getQueryData<{
        pages: Array<{ data: any[] }>;
      }>(["rows", tableId, selectedView, columnFilters, sorting]);

      queryClient.setQueryData(
        ["rows", tableId, selectedView, columnFilters, sorting],
        (old: any) => {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((row: any) =>
                row.id === updatedCell.rowId
                  ? {
                      ...row,
                      cells: row.cells.map((cell: any) =>
                        cell.columnId === updatedCell.columnId
                          ? {
                              ...cell,
                              value: updatedCell.value,
                            }
                          : cell,
                      ),
                    }
                  : row,
              ),
            })),
          };
        },
      );

      setLocalTableRows([
        ...localTableRows.map((row) => {
          if (row.id === updatedCell.rowId) {
            return {
              ...row,
              cells: row.cells.map((cell: any) => {
                if (cell.columnId === updatedCell.columnId) {
                  return {
                    ...cell,
                    value: updatedCell.value,
                  };
                }
                return cell;
              }),
            };
          }
          return row;
        }),
      ]);

      return { previousRows };
    },
    onError: (updatedCell, input, context) => {
      queryClient.setQueryData(
        ["rows", tableId, selectedView, columnFilters, sorting],
        context?.previousRows,
      );
      if (context?.previousRows) {
        setLocalTableRows(
          context.previousRows?.pages?.flatMap((page) => page.data || []) || [],
        );
      }
    },
    onSuccess: () => {
      
    }
  });

  const handleCreateColumn = () => {
    if (!columnName) {
      createColumn.mutate({
        tableId,
        name: "Label " + (localTableColumns?.length ?? 0),
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
              className={`flex h-8 w-full items-center pl-2 ${isMatch ? "bg-yellow-200" : ""}`}
            >
              {col.name}
            </div>
          );
        },
        cell: ({ getValue, row }: { getValue: () => any; row: any }) => {
          const rowId = row.original.id;
          const columnId = col.id;
          const originalValue = getValue();

          const [value, setValue] = useState(
            originalValue === null ||
              originalValue === undefined ||
              originalValue === 0
              ? ""
              : originalValue,
          );

          const isMatch =
            searchQuery.length > 0 &&
            value.toString().toLowerCase().includes(searchQuery.toLowerCase());

          const onBlur = () => {
            updateCell.mutate({
              rowId,
              columnId,
              value: value.toString(),
            });
          };

          useEffect(() => {
            setValue(
              originalValue === null ||
                originalValue === undefined ||
                originalValue === 0
                ? ""
                : originalValue,
            );
          }, [originalValue]);

          return (
            <input
              type={col.type === "NUMBER" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              disabled={
                (columnId.includes("temp") || rowId.includes("temp")) &&
                (isCreatingColumn || isCreatingRow)
              }
              className={`z-50 w-0 flex-auto pl-1 text-[0.75rem] focus:outline-blue-500 ${isMatch ? "m-[-2px] bg-yellow-400" : ""}`}
            />
          );
        },
        sortingFn: "alphanumeric" as const,
        sortUndefined: "last" as const,
        meta: {
          filterVariant:
            col.type === "NUMBER" ? ("range" as const) : ("text" as const),
        },
      })),
    ],

    [localTableColumns, searchQuery, isCreatingColumn, isCreatingRow, selectedView],
  );

  const data = useMemo(
    () =>
      localTableRows.map((row) => {
        if (!row || !row.cells) {
          return {};
        }

        const rowData: Record<string, any> = {};

        row.cells.forEach((cell: Cell) => {
          const columnDef = localTableColumns.find(
            (col) => col.id === cell.columnId,
          );
          rowData[cell.columnId] =
            columnDef?.type === "NUMBER" ? Number(cell.value) : cell.value;
        });
        return { id: row.id, ...rowData };
      }),
    [localTableRows, selectedView],
  );

  const totalDBRowCount = dataInfinite?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = localTableRows.length;

  const fetchMoreOnBottomReached = useCallback(
    (tableContainerRef?: HTMLDivElement | null) => {
      if (tableContainerRef) {
        const { scrollHeight, scrollTop, clientHeight } = tableContainerRef;

        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

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
    manualFiltering: true,
    manualSorting: true,
    columnResizeMode: "onChange",
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  if (tableId === "temp" || isLoading) {
    return (
      <div className="flex h-full flex-auto items-center justify-center">
        <div className="text-[0.75rem] text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
      className="relative max-h-[800px] w-full overflow-auto border bg-gray-50"
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
