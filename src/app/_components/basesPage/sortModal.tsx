import { GoQuestion } from "react-icons/go";

interface sortModalProps {
  ref: React.RefObject<HTMLDivElement>;
  columns: any[];
  setSorting: (newSorting: any) => void;
}

export default function SortModal({
  ref,
  columns,
  setSorting,
}: sortModalProps) {
  const handleToggleSort = (columnId: string) => {
    setSorting((prev: any) => {
      const existingSort = prev.find((sort: any) => sort.id === columnId);

      if (!existingSort) {
        return [...prev, { id: columnId, desc: false }];
      }

      if (existingSort.desc) {
        return prev.filter((sort: any) => sort.id !== columnId);
      }

      return prev.map((sort: any) =>
        sort.id === columnId ? { ...sort, desc: !sort.desc } : sort
      );
    });
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
