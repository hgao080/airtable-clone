import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import {
  useInfiniteQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";

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
import { Cell, Column, Row } from "@prisma/client";

type RowWithCells = Row & {
  cells: Cell[];
};

const fetchSize = 50;

interface TableProps {
  tableId: string;
  localColumns: Column[];
  setLocalColumns: (newColumns: Column[]) => void;
  isFetchingColumns: boolean;
  selectedView: string;
  searchQuery: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (newColumnFilters: any) => void;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (newColumnVisibility: Record<string, boolean>) => void;
  setLocalToolBarColumns: (newColumns: any[]) => void;
}

export default function Table({
  tableId,
  localColumns,
  setLocalColumns,
  isFetchingColumns,
  selectedView,
  searchQuery,
  sorting,
  columnFilters,
  columnVisibility,
  setColumnVisibility,
  setLocalToolBarColumns,
}: TableProps) {
  const queryClient = useQueryClient();
  const trpc = api.useUtils();

  const [localRows, setLocalRows] = useState<RowWithCells[]>([]);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isCreatingRow, setIsCreatingRow] = useState(false);

  // States for adding a column
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState<"TEXT" | "NUMBER">("TEXT");

  const {
    data: rowData,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [tableId],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * fetchSize;
      return await trpc.row.getRows.fetch({
        tableId: tableId,
        start,
        size: fetchSize,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (rowData) {
      setLocalRows(
        rowData?.pages?.flatMap((page: { data: any }) => page.data) ?? [],
      );
    }
  }, [rowData]);

  const createRow = api.row.addRow.useMutation({
    onMutate: (data) => {
      setIsCreatingRow(true);
      const tableId = data.tableId;
      const previousRows = localRows;

      const tempId = `temp-row-${Date.now()}`;
      const placeholderRow = {
        id: tempId,
        tableId: tableId,
        created: new Date(),
        cells: localColumns.map((col) => ({
          value: "",
          id: `temp-cell-${col.id}`,
          columnId: col.id,
          rowId: tempId,
        })),
      };

      setLocalRows([...localRows, placeholderRow]);

      return { previousRows, tableId, tempId };
    },
    onSuccess: (createdRow, data, context) => {
      setIsCreatingRow(false);

      if (!createdRow) {
        setLocalRows(context.previousRows);
        return;
      }

      if (context.tableId !== tableId) {
        return;
      }

      setLocalRows((prevRows) => [
        ...prevRows.filter((row) => row.id !== context.tempId),
        createdRow,
      ]);
    },
  });
  const handleCreateRow = () => {
    createRow.mutate({
      tableId,
    });
  };

  const createColumn = api.column.addColumn.useMutation({
    onMutate: (newColumn) => {
      setIsCreatingColumn(true);

      const tableId = newColumn.tableId;
      const previousColumns = localColumns;
      const previousRows = localRows;

      const tempId = `temp-col-${Date.now()}`;
      const placeholderColumn = {
        id: tempId,
        tableId: tableId,
        name: newColumn.name,
        type: newColumn.type,
        created: new Date(),
      };

      setLocalColumns([...localColumns, placeholderColumn]);

      setLocalRows((prevRows) => [
        ...prevRows.map((row) => ({
          ...row,
          cells: [
            ...row.cells,
            {
              value: "",
              columnId: tempId,
              rowId: row.id,
            },
          ],
        })),
      ]);

      return { previousColumns, previousRows, tableId, tempId };
    },
    onSuccess: (createdColumn, newColumn, context) => {
      setIsCreatingColumn(false);

      if (!createdColumn) {
        setLocalColumns(context.previousColumns);
        setLocalRows(context.previousRows);
        return;
      }

      if (context.tableId !== tableId) {
        return;
      }

      setLocalColumns([
        ...localColumns.filter((col) => col.id !== context?.tempId),
        createdColumn,
      ]);

      setLocalRows((prevRows) => [
        ...prevRows.map((row) => ({
          ...row,
          cells: [
            ...row.cells.map((cell) => {
              if (cell.columnId === context.tempId) {
                return {
                  value: "",
                  columnId: createdColumn.id,
                  rowId: row.id,
                };
              }
              return cell;
            }),
          ],
        })),
      ]);
    },
  });

  const handleCreateColumn = () => {
    if (!columnName) {
      createColumn.mutate({
        tableId,
        name: "Label " + (localColumns?.length ?? 0),
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

  const handleOpenColumnModal = () => {
    setShowColumnModal(true);
  };

  const handleCloseColumnModal = () => {
    setShowColumnModal(false);
    setColumnName("");
    setColumnType("TEXT");
  };

  const addBulkRows = api.row.addBulkRows.useMutation({
    onMutate: () => {
      setIsCreatingRow(true);
    },
    onError: (err) => {
      setIsCreatingRow(false);
      console.error(err);
    },
    onSuccess: (data) => {
      setIsCreatingRow(false);
      console.log(data?.message);
    },
  });

  const handleAddBulkRows = () => {
    addBulkRows.mutate({
      tableId,
    });
  };

  const updateCell = api.cell.updateCell.useMutation({
    onMutate: () => {},
    onSuccess: (updatedCell) => {
      queryClient.setQueriesData({ queryKey: [tableId] }, (oldData: any) => {
        return {
          pages: oldData.pages.map((page: any) => {
            return {
              ...page,
              data: page.data.map((row: RowWithCells) => {
                return {
                  ...row,
                  cells: row.cells.map((cell : Cell) => {
                    if (cell.columnId === updatedCell.columnId && cell.rowId === updatedCell.rowId) {
                      return updatedCell;
                    }
                    return cell;
                  }),
                };
              }),
            };
          }),
        };
      });
    },
  });

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
      ...(localColumns || []).map((col) => ({
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
        cell: ({
          getValue,
          row,
        }: {
          getValue: () => any;
          row: any;
          column: any;
          table: any;
        }) => {
          const rowId = row.original.rowId;
          const columnId = col.id;

          const initialValue = getValue() ?? "";
          const [value, setValue] = useState(initialValue);

          const isMatch =
            searchQuery.length > 0 &&
            value.toString().toLowerCase().includes(searchQuery.toLowerCase());

          useEffect(() => {
            setValue(initialValue);
          }, [initialValue]);

          const onBlur = () => {
            updateCell.mutate({
              rowId,
              columnId,
              value: value.toString(),
            });
          };

          return (
            <input
              type={col.type === "NUMBER" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              disabled={columnId.includes("temp") || rowId.includes("temp")}
              className={`z-50 w-0 flex-auto pl-1 text-[0.75rem] focus:outline-blue-500 ${isMatch ? "m-[-2px] bg-yellow-400" : ""}`}
            />
          );
        },
      })),
    ],

    [localColumns, searchQuery, isCreatingColumn, isCreatingRow],
  );

  const data = useMemo(
    () =>
      localRows.map((row) => {
        return {
          rowId: row.id,
          ...row.cells.reduce((acc: Record<string, string | number>, cell) => {
            acc[cell.columnId] = cell.value;
            return acc;
          }, {}),
        };
      }),
    [localRows, selectedView],
  );

  const totalDBRowCount = rowData?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = localRows.length;

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
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    columnResizeMode: "onChange",
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  if (
    tableId === "temp" ||
    isLoading ||
    !localColumns ||
    !data ||
    isFetchingColumns
  ) {
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
      className="relative flex max-h-[800px] w-full flex-auto items-start overflow-auto border bg-gray-50"
    >
      <table className="grid">
        <thead className="sticky top-0 z-10 grid h-8">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="flex" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={`relative flex flex-col border border-t-0 border-gray-300 bg-gray-100 text-[0.8rem] font-light`}
                >
                  <div>
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
          handleCreateKRows={handleAddBulkRows}
          isCreating={isCreatingColumn || isCreatingRow}
        />
      </table>
    </div>
  );
}
