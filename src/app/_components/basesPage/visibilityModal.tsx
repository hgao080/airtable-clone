import { Column } from "@prisma/client";
import { useState } from "react";
import { GoQuestion } from "react-icons/go";
import { PiToggleRightFill } from "react-icons/pi";

import { api } from "~/trpc/react";

interface visibilityModalProps {
  ref: React.RefObject<HTMLDivElement>;
  columns: any[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (newVisibility: Record<string, boolean>) => void;
  selectedView: string;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
  refetchColumns: () => void;
  localColumns: Column[];
  setLocalColumns: (newColumns: any[]) => void;
}

export default function VisiblityModal({
  ref,
  columns,
  setColumnVisibility,
  columnVisibility,
  selectedView,
  localViews,
  setLocalViews,
  refetchColumns,
  localColumns,
  setLocalColumns,
}: visibilityModalProps) {
  const [searchField, setSearchField] = useState<string>("");
  const filteredColumns = columns.filter((col) =>
    col.name.toLowerCase().includes(searchField.toLowerCase()),
  );

  const updateColumnVisibility = api.view.updateColumnVisibility.useMutation({
    onSuccess: () => {
      void refetchColumns();
    },
  });

  const handleToggleVisibility = (columnId: string, columnName: string) => {
    const newColumnVisibility = { ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
     };

    updateColumnVisibility.mutate({
      viewId: selectedView,
      columnVisibility: newColumnVisibility,
    });

    // if (localColumns.some((col) => col.id === columnId)) {
    //   setLocalColumns(localColumns.filter((col) => col.id !== columnId));
    // } else {
    //   setLocalColumns([
    //     ...localColumns,
    //     {
    //       id: columnId,
    //       name: columnName,
    //     },
    //   ]);
    // }

    setLocalViews(
      localViews.map((view) => {
        if (view.id === selectedView) {
          return {
            ...view,
            columnVisibility: newColumnVisibility,
          };
        }
        return view;
      }),
    );
    setColumnVisibility(newColumnVisibility);
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
        {filteredColumns.map((col) => (
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
