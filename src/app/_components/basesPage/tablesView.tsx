"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { SlArrowDown } from "react-icons/sl";
import { FaPlus } from "react-icons/fa6";
import Toolbar from "./toolbar";

export default function TablesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");

  if (!baseId) {
    router.back();
    return null;
  }

  const { data: tables, refetch } = api.table.getTablesByBase.useQuery({
    baseId,
  });

  const [selectedTable, setSelectedTable] = useState(tables?.[0]?.name);

  const createTable = api.table.createTable.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (tables) {
      setSelectedTable(tables[0]?.name);
    }
  }, [tables]);

  return (
    <div className="flex flex-auto flex-col">
      <div className="flex justify-between gap-2 bg-rose-600">
        <div className="flex flex-auto items-center rounded-tr-md bg-rose-700 pl-3">
          {tables?.map((table) => (
            <button
              key={table.id}
              value={table.name}
              className="flex items-center"
              onClick={() => setSelectedTable(table.name)}
            >
              <div
                className={`flex items-center justify-center gap-2 px-3 py-2 text-[0.75rem] ${table.name === selectedTable ? "rounded-t-sm bg-white text-black" : "text-white hover:bg-rose-800"}`}
              >
                {table.name}
                {table.name === selectedTable ? (
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
          <button className="flex gap-2 items-center pl-4 text-[0.75rem] font-light text-white">
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

      <Toolbar />

      {/* {tables?.map((table) => (
        <div key={table.id} className="">
          <h3>{table.name}</h3>
          <Table tableId={table.id} />
        </div>
      ))} */}
    </div>
  );
}
