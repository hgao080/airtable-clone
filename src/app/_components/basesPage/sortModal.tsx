import { SortingState } from "@tanstack/react-table";
import { GoQuestion } from "react-icons/go";

import { api } from "~/trpc/react";

interface sortModalProps {
  ref: React.RefObject<HTMLDivElement>;
  columns: any[];
  sorting: SortingState
  setSorting: (newSorting: any) => void;
  selectedView: string;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
  refetchRows: () => void;
}

export default function SortModal({
  ref,
  columns,
  sorting,
  setSorting,
  selectedView,
  localViews,
  setLocalViews,
  refetchRows,
}: sortModalProps) {

  const updateSortingState = api.view.updateSortingState.useMutation({
    onSuccess: () => {
      void refetchRows();
    }
  });

  const handleToggleSort = (columnId: string) => {
    const existingSort = sorting.find((sort: any) => sort.id === columnId);

    let newSorting: SortingState
    if (!existingSort) {
      newSorting = [...sorting, { id: columnId, desc: false }];
    } else {
      if (existingSort.desc) {
        newSorting = sorting.filter((sort: any) => sort.id !== columnId);
      } else {
        newSorting = sorting.map((sort: any) => 
          sort.id === columnId ? { ...sort, desc: !sort.desc } : sort
        )
      }
    }

    updateSortingState.mutate({
      viewId: selectedView,
      sortingState: newSorting
    })

    setLocalViews(
      localViews.map((view) => {
        if (view.id === selectedView) {
          return {
            ...view,
            sortingState: newSorting
          }
        }
        return view;
      })
    )

    setSorting(newSorting);
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-8 z-50 flex min-w-[18rem] flex-col gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-md"
    >
      <div className="flex flex-auto items-center justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-[0.75rem] font-medium">Sort by</h3>
          <GoQuestion size={14} className="translate-y-[-1px] text-gray-400" />
        </div>
        <div className="flex items-center">
          <p className="text-[0.65rem] font-light">Copy from a view</p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-200"></div>

      <div className="flex flex-col items-start">
        {columns.map((col) => (
          <button
            onClick={() => handleToggleSort(col.id)}
            key={col.id}
            className="w-full px-2 py-1 text-start text-[0.8rem] hover:bg-gray-100"
          >
            {col.name}
          </button>
        ))}
      </div>
    </div>
  );
}
