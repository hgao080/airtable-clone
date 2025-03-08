"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { SlArrowDown } from "react-icons/sl";
import { FaPlus } from "react-icons/fa6";
import Toolbar from "./toolbar";
import Table from "./table";
import ViewsModal from "./viewsModal";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Column, Row } from "@prisma/client";
import { keepPreviousData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const fetchSize = 50;

export default function TablesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");

  const trpc = api.useUtils();

  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [localRows, setLocalRows] = useState<Row[]>([]);
  
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedView, setSelectedView] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const {
    data: rowData,
    fetchNextPage,
    isFetching,
    isLoading,
    refetch: refetchRows,
  } = useInfiniteQuery({
    queryKey: ['rows', selectedTable, selectedView, JSON.stringify(columnFilters), JSON.stringify(sorting)],
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * fetchSize;
      return await trpc.row.getRowsFilteredSorted.fetch({
        tableId: selectedTable,
        viewId: selectedView,
        start,
        size: fetchSize,
        columnFilters: columnFilters,
        sorting: sorting,
      });
    },
    enabled: !!selectedTable && !!selectedView,
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: tables } =
    api.table.getTablesByBase.useQuery({
      baseId,
    });
  const { data: columns, refetch: refetchColumns } =
    api.column.getVisibleColumns.useQuery({
      tableId: selectedTable,
      viewId: selectedView,
    });
  const { data: views, refetch: refetchViews } =
    api.view.getViewsByTable.useQuery({
      tableId: selectedTable,
    });
  const { data: toolBarColumns, refetch: refetchToolBarColumns } =
    api.column.getColumns.useQuery({
      tableId: selectedTable,
    });

  const [localViews, setLocalViews] = useState(views ?? []);
  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);
  

  const [localTables, setLocalTables] = useState(tables ?? []);
  const [localToolBarColumns, setLocalToolBarColumns] = useState(
    toolBarColumns ?? [],
  );

  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tables) {
      setSelectedTable(tables[tables.length - 1]?.id ?? "");
      setLocalTables(tables);
    }
  }, [tables]);

  useEffect(() => {
    if (toolBarColumns) {
      setLocalToolBarColumns(toolBarColumns);
    }
  }, [toolBarColumns]);

  useEffect(() => {
    if (columns) {
      setLocalColumns(columns);
    }
  }, [columns]);

  useEffect(() => {
    if (rowData?.pages[0]) {
      setLocalRows(
        rowData.pages.flatMap((page) => ("data" in page ? page.data : [])),
      );
    }
  }, [rowData]);

  useEffect(() => {
    if (views) {
      setLocalViews(views);
      setSelectedView(views[0]?.id ?? "");
    }
  }, [views]);

  useEffect(() => {
    if (selectedView) {
      setColumnVisibility(
        (localViews?.find((view) => view.id === selectedView)
          ?.columnVisibility as unknown as Record<string, boolean>) ?? {},
      );
      setSorting(
        (localViews?.find((view) => view.id === selectedView)
          ?.sortingState as unknown as SortingState) ?? [],
      );
      setColumnFilters(
        (localViews?.find((view) => view.id === selectedView)
          ?.columnFilters as unknown as ColumnFiltersState) ?? [],
      );
    }
  }, [selectedView]);

  if (!baseId) {
    router.back();
    return null;
  }

  const createTable = api.table.createTable.useMutation({
    onMutate: (data) => {
      setIsCreatingTable(true);
      const previousTables = localTables;

      setLocalTables([
        ...localTables,
        {
          id: "temp",
          name: data.name,
          baseId,
        },
      ]);
      setSelectedTable("temp");

      return { previousTables };
    },
    onError: (err, data, context) => {
      setIsCreatingTable(false);
      setLocalTables(context?.previousTables ?? []);
    },
    onSuccess: (createdTable) => {
      setIsCreatingTable(false);
      setSelectedTable(createdTable.id);
      setLocalTables([
        ...localTables.filter((table) => table.id !== "temp"),
        createdTable,
      ]);
    },
  });

  const handleCreateTable = () => {
    createTable.mutate({
      baseId,
      name: "Table " + (tables ? tables.length + 1 : 0),
    });
  };

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
                setLocalColumns([]);
                setLocalRows([]);
                setLocalViews([]);
                setSelectedTable(table.id);
                void refetchColumns();
                void refetchViews();
                void refetchRows();
              }}
            >
              <div
                className={`flex items-center justify-center gap-2 px-3 py-2 text-[0.75rem] ${table.id === selectedTable ? "rounded-t-sm bg-white text-black" : "text-white hover:bg-rose-800"}`}
              >
                {table.name}
                {table.id === selectedTable ? (
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
            onClick={handleCreateTable}
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

      <Toolbar
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

        {selectedTable && (
          <Table
            tableId={selectedTable}
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
            localTableRows={localRows ?? []}
            setLocalTableRows={setLocalRows}
            fetchNextPage={fetchNextPage}
            isFetching={isFetching}
            isLoading={isLoading}
            dataInfinite={rowData}
          />
        )}
      </div>
    </div>
  );
}
