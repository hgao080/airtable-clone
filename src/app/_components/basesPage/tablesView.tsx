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

export default function TablesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");

  const [selectedTable, setSelectedTable] = useState<string>("");

  const { data: tables, refetch: refetchTables } =
    api.table.getTablesByBase.useQuery({
      baseId,
    });
  const { data: columns, refetch: refetchColumns } =
    api.column.getColumns.useQuery({
      tableId: selectedTable,
    });
  const { data: views, refetch: refetchViews } =
    api.view.getViewsByTable.useQuery({
      tableId: selectedTable,
    });

  const [localViews, setLocalViews] = useState(views ?? []);
  const [selectedView, setSelectedView] = useState<string | undefined>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [localTables, setLocalTables] = useState(tables ?? []);
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  const [localColumns, setLocalColumns] = useState(columns ?? []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedTable && selectedTable !== "temp") {
      void refetchViews();
      void refetchColumns();
    }
  }, [selectedTable]);

  useEffect(() => {
    if (tables) {
      setSelectedTable(tables[tables.length - 1]?.id ?? "");
      setLocalTables(tables);
    }
  }, [tables]);

  useEffect(() => {
    if (columns) {
      setLocalColumns(columns);
    }
  }, [columns]);

  useEffect(() => {
    if (views) {
      setLocalViews(views);
      setSelectedView(views[0]?.id ?? "");
    }
  }, [views]);

  useEffect(() => {
    if (selectedView) {
      setColumnVisibility(localViews?.find((view) => view.id === selectedView)?.columnVisibility as unknown as Record<string, boolean> ?? {});
      setSorting(localViews?.find((view) => view.id === selectedView)?.sortingState as unknown as SortingState ?? []);
      setColumnFilters(localViews?.find((view) => view.id === selectedView)?.columnFilters as unknown as ColumnFiltersState ?? []);
    }
  }, [selectedView])

  if (!baseId) {
    router.back();
    return null;
  }

  const createTable = api.table.createTable.useMutation({
    onMutate: (data) => {
      setIsCreatingTable(true);
      const previousTables = localTables;

      setLocalTables((prevTables) => {
        return [
          ...prevTables,
          {
            id: "temp",
            name: data.name,
            baseId,
          },
        ];
      });
      setSelectedTable("temp");

      return { previousTables };
    },
    onError: (err, data, context) => {
      setIsCreatingTable(false);
      setLocalTables(context?.previousTables ?? []);
    },
    onSuccess: (createdTable) => {
      setIsCreatingTable(false);
      void refetchTables();
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
    <div className="flex flex-auto flex-col overflow-auto">
      <div className="flex justify-between gap-2 bg-rose-600">
        <div className="flex flex-auto items-center rounded-tr-md bg-rose-700 pl-3">
          {localTables?.map((table) => (
            <button
              key={table.id}
              value={table.id}
              className="flex items-center"
              onClick={() => {
                setSelectedTable(table.id);
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
        searchQuery={searchQuery}
        onSearchChange={(newQuery) => setSearchQuery(newQuery)}
        sorting={sorting}
        setSorting={setSorting}
        selectedView={selectedView}
        localViews={localViews}
        setLocalViews={setLocalViews}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        isViewsModalOpen={isViewsModalOpen}
        setIsViewsModalOpen={setIsViewsModalOpen}
        localColumns={localColumns}
      />

      <div className="flex flex-auto">
        {isViewsModalOpen && (
          <ViewsModal
            tableId={selectedTable}
            views={localViews}
            setLocalViews={setLocalViews}
            selectedView={selectedView ?? ""}
            setSelectedView={setSelectedView}
          />
        )}

        {selectedTable && (
          <Table
            tableId={selectedTable}
            searchQuery={searchQuery}
            sorting={sorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            columnVisibility={columnVisibility}
            localTableColumns={localColumns}
            setLocalTableColumns={setLocalColumns}
          />
        )}
      </div>
    </div>
  );
}
