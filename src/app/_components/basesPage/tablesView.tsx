"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { SlArrowDown } from "react-icons/sl";
import { FaPlus } from "react-icons/fa6";
import Toolbar from "./toolbar";
import Table from "./table";
import ViewsModal from "./viewsModal";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Column, Row, Table as TableType, View } from "@prisma/client";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getQueryClient } from "~/app/_providers/getQueryClient";

const fetchSize = 50;

export default function TablesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");
  const queryClient = getQueryClient();

  const trpc = api.useUtils();

  const [localColumns, setLocalColumns] = useState<Column[]>([]);

  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [selectedView, setSelectedView] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const [localViews, setLocalViews] = useState<View[]>([]);
  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);

  const [localTables, setLocalTables] = useState<TableType[]>([]);
  const [localToolBarColumns, setLocalToolBarColumns] = useState<Column[]>([]);

  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: rowData,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["rows", selectedTableId],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * fetchSize;
      return await trpc.row.getRows.fetch({
        tableId: selectedTableId,
        start,
        size: fetchSize,
      });
    },
    enabled: !!selectedTableId,
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: tables } = api.table.getTablesByBase.useQuery({
    baseId,
  });
  const { data: columns, refetch: refetchColumns } =
    api.column.getVisibleColumns.useQuery({
      tableId: selectedTableId,
      viewId: selectedView,
    });
  const { data: views, refetch: refetchViews } =
    api.view.getViewsByTable.useQuery({
      tableId: selectedTableId,
    });
  const { data: toolBarColumns, refetch: refetchToolBarColumns } =
    api.column.getColumns.useQuery({
      tableId: selectedTableId,
    });

  if (!baseId) {
    router.back();
    return null;
  }

  // const createTable = api.table.createTable.useMutation({
  //   onMutate: (data) => {
  //     setIsCreatingTable(true);
  //     const previousTables = localTables;

  //     setLocalTables([
  //       ...localTables,
  //       {
  //         id: "temp",
  //         name: data.name,
  //         baseId,
  //       },
  //     ]);
  //     setSelectedTable("temp");

  //     return { previousTables };
  //   },
  //   onError: (err, data, context) => {
  //     setIsCreatingTable(false);
  //     setLocalTables(context?.previousTables ?? []);
  //   },
  //   onSuccess: (createdTable) => {
  //     setIsCreatingTable(false);
  //     setSelectedTable(createdTable.id);
  //     setLocalTables([
  //       ...localTables.filter((table) => table.id !== "temp"),
  //       createdTable,
  //     ]);
  //   },
  // });

  // const handleCreateTable = () => {
  //   createTable.mutate({
  //     baseId,
  //     name: "Table " + (tables ? tables.length + 1 : 0),
  //   });
  // };

  if (baseId === "creating") {
    return (
      <div className="flex flex-auto flex-col items-center justify-center">
        <h1 className="text-[1.5rem] font-semibold text-gray-700">
          Creating Base...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-auto flex-col">
      <div className="flex justify-between gap-2 bg-rose-600">
        <div className="flex flex-auto items-center rounded-tr-md bg-rose-700 pl-3">
          {localTables?.map((table) => (
            <button
              key={table.id}
              value={table.id}
              className="flex items-center"
              onClick={() => {
                queryClient.removeQueries({ queryKey: ["rows"] });
                setLocalColumns([]);
                setLocalViews([]);
                setSelectedTableId(table.id);
              }}
            >
              <div
                className={`flex items-center justify-center gap-2 px-3 py-2 text-[0.75rem] ${table.id === selectedTableId ? "rounded-t-sm bg-white text-black" : "text-white hover:bg-rose-800"}`}
              >
                {table.name}
                {table.id === selectedTableId ? (
                  <SlArrowDown size={10} className="text-black" />
                ) : null}
              </div>
              <div className="h-[12px] w-[1px] bg-white/20"></div>
            </button>
          ))}
          <button className="mx-4">
            <SlArrowDown size={10} className="text-white" />
          </button>
          <div className="h-[12px] w-[1px] bg-white/20"></div>
          <button
            // onClick={handleCreateTable}
            className="flex items-center gap-2 pl-4 text-[0.75rem] font-light text-white"
            disabled={isCreatingTable}
          >
            <FaPlus size={16} className="text-white/40" />
            Add or Import
          </button>
        </div>

        <div className="flex items-center gap-6 rounded-tl-md bg-rose-700 px-3 py-1 text-[0.8rem] font-light text-white">
          <button className="">Extension</button>
          <button className="flex items-center gap-2">
            Tools <SlArrowDown size={10} />
          </button>
        </div>
      </div>

      {/* <Toolbar
        selectedTable={selectedTable}
        allColumns={localToolBarColumns ?? []}
        searchQuery={searchQuery}
        onSearchChange={(newQuery) => setSearchQuery(newQuery)}
        sorting={sorting}
        setSorting={setSorting}
        selectedView={selectedView}
        localViews={localViews}
        setLocalViews={setLocalViews}
        refetchViews={refetchViews}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        isViewsModalOpen={isViewsModalOpen}
        setIsViewsModalOpen={setIsViewsModalOpen}
        refetchColumns={refetchColumns}
        localColumns={localColumns}
        setLocalColumns={setLocalColumns}
        localRows={localRows}
        setLocalRows={setLocalRows}
        refetchRows={refetchRows}
      />

      <div className="flex flex-auto">
        {isViewsModalOpen && (
          <ViewsModal
            tableId={selectedTable}
            views={localViews}
            setLocalViews={setLocalViews}
            selectedView={selectedView ?? ""}
            setSelectedView={setSelectedView}
            setSorting={setSorting}
            setColumnFilters={setColumnFilters}
            setColumnVisibility={setColumnVisibility}
          />
          )}
        </div>
        */}

        {selectedTableId && (
          <Table
            tableId={selectedTableId}
            rowData={rowData}
            selectedView={selectedView}
            searchQuery={searchQuery}
            sorting={sorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            setLocalToolBarColumns={setLocalToolBarColumns}
            localTableColumns={localColumns}
            setLocalTableColumns={setLocalColumns}
            fetchNextPage={fetchNextPage}
            isFetching={isFetching}
            isLoading={isLoading}
          />
        )}
      </div>
  );
}
