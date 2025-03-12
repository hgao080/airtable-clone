import { Column, View } from "@prisma/client";
import { useState } from "react";
import { GoQuestion } from "react-icons/go";
import { PiToggleRightFill } from "react-icons/pi";

import { api } from "~/trpc/react";

interface visibilityModalProps {
  ref: React.RefObject<HTMLDivElement>;
  allColumns: any[];
  selectedView: View;
  setSelectedView: (newView: View) => void;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
}

export default function VisiblityModal({
  ref,
  allColumns,
  selectedView,
  setSelectedView,
  localViews,
  setLocalViews,
}: visibilityModalProps) {
  const [searchField, setSearchField] = useState<string>("");
  const filteredColumns = allColumns.filter((col) =>
    col.name.toLowerCase().includes(searchField.toLowerCase()),
  );
  const columnVisibility = selectedView.columnVisibility as Record<string, boolean>;

  const updateColumnVisibility = api.view.updateColumnVisibility.useMutation({
    onMutate: (newData) => {
      setLocalViews(
        localViews.map((view) => {
          if (view.id === selectedView.id) {
            return {
              ...view,
              columnVisibility: newData.columnVisibility,
            };
          }
          return view;
        }),
      );
      setSelectedView({
        ...selectedView,
        columnVisibility: newData.columnVisibility,
      })
      return { previousData: selectedView };
    },
  });

  const handleToggleVisibility = (columnId: string, columnName: string) => {
    const newColumnVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };

    updateColumnVisibility.mutate({
      viewId: selectedView.id,
      columnVisibility: newColumnVisibility,
    });
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-8 z-50 flex min-w-[18rem] flex-col gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-md"
    >
      <div className="flex items-center justify-between">
        <input
          type="text"
          className="text-[0.75rem] focus:outline-none"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          placeholder="Find a field"
        />
        <GoQuestion size={14} className="text-gray-400" />
      </div>

      <div className="h-[2px] w-full bg-gray-200"></div>

      <div className="flex flex-col items-start">
        {filteredColumns.map((col, index) => (
          <button
            key={col.id}
            onClick={() => handleToggleVisibility(col.id, col.name)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-start text-[0.8rem] hover:bg-gray-100"
          >
            <PiToggleRightFill
              size={16}
              fill={`${columnVisibility[col.id] ? "green" : "gray"}`}
              className={`${columnVisibility[col.id] ? "" : "scale-x-[-1]"}`}
            />
            {col.name}
          </button>
        ))}
      </div>
    </div>
  );
}
