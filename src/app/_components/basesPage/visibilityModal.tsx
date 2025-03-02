import { GoQuestion } from "react-icons/go";
import { PiToggleRightFill } from "react-icons/pi";

interface visibilityModalProps {
  ref: React.RefObject<HTMLDivElement>;
  columns: any[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (newVisibility: Record<string, boolean>) => void;
}

export default function VisiblityModal({
  ref,
  columns,
  setColumnVisibility,
  columnVisibility,
} : visibilityModalProps) {

  const handleToggleVisibility = (columnId: string) => {
    setColumnVisibility({
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId]
    })
  };

  return (
    <div ref={ref} className="absolute left-0 top-8 z-50 flex min-w-[18rem] flex-col gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-[0.75rem] font-light">Find a field</p>
        <GoQuestion size={14} className="text-gray-400" />
      </div>

      <div className="h-[2px] w-full bg-gray-200"></div>

      <div className="flex flex-col items-start">
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => handleToggleVisibility(col.id)}
            className="flex items-center gap-2 w-full px-2 py-1 text-start text-[0.8rem] hover:bg-gray-100 rounded-md"
          >
            <PiToggleRightFill size={16} fill={`${columnVisibility[col.id] ? 'green' : 'gray'}`} className={`${columnVisibility[col.id] ? "" : "scale-x-[-1]"}`} />
            {col.name}
          </button>
        ))}
      </div>
    </div>
  )
}