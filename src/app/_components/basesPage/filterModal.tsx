import { Row } from "@prisma/client";
import {
  useQueryClient,
} from "@tanstack/react-query";
import { ColumnFilter } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { GoQuestion } from "react-icons/go";
import { PiTrash } from "react-icons/pi";
import { RiDraggable } from "react-icons/ri";
import { api } from "~/trpc/react";

interface FilterModalProps {
  selectedTable: string;
  ref: React.RefObject<HTMLDivElement>;
  allColumns: any[];
  columnFilters: ColumnFilter[];
  setColumnFilters: (newColumnFilters: ColumnFilter[]) => void;
  selectedView: string;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
  localRows: Row[];
  setLocalRows: (newRows: Row[]) => void;
  refetchRows: () => void;
}

interface ColumnFilterValue {
  operator: string;
  value: string;
}

interface Condition {
  conditionIndex: number;
  id: string;
  value: ColumnFilterValue;
}

const operators = [
  {
    id: "",
    name: "",
  },
  {
    id: "contains",
    name: "contains",
  },
  {
    id: "not_contains",
    name: "does not contain",
  },
  {
    id: "equals",
    name: "is",
  },

  {
    id: "is_empty",
    name: "is empty",
  },
  {
    id: "is_not_empty",
    name: "is not empty",
  },
];

const numberOperators = [
  {
    id: "",
    name: "",
  },
  {
    id: "greater_than",
    name: ">",
  },
  {
    id: "less_than",
    name: "<",
  },
];

export default function FilterModal({
  selectedTable,
  ref,
  allColumns,
  setColumnFilters,
  columnFilters,
  selectedView,
  localViews,
  setLocalViews,
  refetchRows,
}: FilterModalProps) {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [conditions, setConditions] = useState<Condition[]>(
    columnFilters?.map((filter, index) => ({
      ...filter,
      conditionIndex: index,
      id: filter.id,
      value: {
        operator: (filter.value as ColumnFilterValue).operator,
        value: (filter.value as ColumnFilterValue).value,
      },
    })) ?? [
      { conditionIndex: 0, id: allColumns[0].id, value: { operator: "", value: "" } },
    ],
  );

  const updateColumnFilters = api.view.updateColumnFilters.useMutation({
    onMutate: (data) => {
      setLocalViews(
        localViews.map((view) => {
          if (view.id === selectedView) {
            return {
              ...view,
              columnFilters: data.columnFilters,
            };
          }
          return view;
        }),
      );
    },
    onSuccess: (updatedView) => {
      void refetchRows();
    },
  });

  const debouncedUpdateFilters = (newConditions: Condition[]) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      updateColumnFilters.mutate({
        viewId: selectedView,
        columnFilters: newConditions,
      });
    }, 500); // 1 second debounce
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleColumnChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    conditionIndex: number,
  ) => {
    const newConditions = conditions.map((condition) => {
      if (condition.conditionIndex === conditionIndex) {
        return {
          ...condition,
          id: e.target.value,
        };
      }
      return condition;
    });

    setConditions(newConditions);
    setColumnFilters(newConditions);

    debouncedUpdateFilters(newConditions);
  };

  const handleOperatorChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    conditionIndex: number,
  ) => {
    const newConditions = conditions.map((condition) => {
      if (condition.conditionIndex === conditionIndex) {
        return {
          ...condition,
          value: {
            ...condition.value,
            operator: e.target.value,
          },
        };
      }
      return condition;
    });

    setConditions(newConditions);
    setColumnFilters(newConditions);

    debouncedUpdateFilters(newConditions);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    conditionIndex: number,
  ) => {
    const newConditions = conditions.map((condition) => {
      if (condition.conditionIndex === conditionIndex) {
        return {
          ...condition,
          value: {
            ...condition.value,
            value: e.target.value,
          },
        };
      }
      return condition;
    });

    setConditions(newConditions);
    setColumnFilters(newConditions);

    debouncedUpdateFilters(newConditions);
  };

  const handleAddCondition = () => {
    const newCondition = {
      conditionIndex: conditions.length,
      id: allColumns[0].id,
      value: {
        operator: "",
        value: "",
      },
    };

    const newConditions = [...conditions, newCondition];

    updateColumnFilters.mutate({
      viewId: selectedView,
      columnFilters: newConditions,
    });

    setConditions([...conditions, newCondition]);
  };

  const handleDeleteCondition = (conditionIndex: number) => {
    const newConditions = conditions.filter(
      (condition) => condition.conditionIndex !== conditionIndex,
    );

    const updatedConditions = newConditions.map((condition) => {
      if (condition.conditionIndex > conditionIndex) {
        return {
          ...condition,
          conditionIndex: condition.conditionIndex - 1,
        };
      }
      return condition;
    });

    updateColumnFilters.mutate({
      viewId: selectedView,
      columnFilters: updatedConditions,
    });

    setConditions(updatedConditions);
    setColumnFilters(updatedConditions);
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-8 z-50 flex min-w-[32rem] flex-col gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-md"
    >
      <p
        className={`flex items-center gap-1 text-[0.8rem] ${conditions.length > 0 ? "" : "text-gray-400"}`}
      >
        {conditions.length > 0
          ? "In this view, show records"
          : "No filter conditions are applied"}
        {conditions.length == 0 ? (
          <GoQuestion size={15} className="translate-y-[-1px]" />
        ) : null}
      </p>

      <div className="flex flex-col gap-1 px-2">
        {conditions.map((condition) => (
          <div
            key={condition.conditionIndex}
            className="flex w-full items-center gap-2 text-[0.8rem]"
          >
            <p
              className={`flex min-w-12 items-center justify-center rounded-sm py-2 text-[0.75rem] ${condition.conditionIndex != 0 ? "border" : ""}`}
            >
              {condition.conditionIndex == 0 ? "Where" : "and"}
            </p>
            <div className="flex flex-auto text-[0.8rem]">
              <select
                className="w-0 flex-auto truncate rounded-l-sm border border-gray-200 py-2 pl-1"
                defaultValue={condition.id}
                onChange={(e) => {
                  handleColumnChange(e, condition.conditionIndex);
                }}
              >
                {allColumns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>

              <select
                className="w-0 flex-auto truncate border border-gray-200 py-2 pl-1"
                value={condition.value.operator}
                onChange={(e) => {
                  handleOperatorChange(e, condition.conditionIndex);
                }}
              >
                {allColumns.find((col) => col.id === condition.id).type ===
                "TEXT" ? (
                  <>
                    {operators.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    {numberOperators.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <input
                type={
                  allColumns.find((col) => col.id === condition.id).type === "TEXT"
                    ? "text"
                    : "number"
                }
                className="w-0 flex-auto border border-gray-200 pl-2 focus:outline-blue-500"
                placeholder="Enter a value"
                value={condition.value.value}
                onChange={(e) => {
                  handleFilterChange(e, condition.conditionIndex);
                }}
              />
              <button
                onClick={() => handleDeleteCondition(condition.conditionIndex)}
                className="flex border p-2"
              >
                <PiTrash size={16} className="" />
              </button>
              <button className="flex border p-2">
                <RiDraggable size={16} className="" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddCondition}
            className={`text-[0.8rem] font-medium ${conditions.length > 0 ? "text-blue-700" : ""}`}
          >
            + Add condition
          </button>
          <button className="flex items-center gap-1 text-[0.8rem] font-medium">
            + Add condition group
            <GoQuestion size={14} className="translate-y-[-1px]" />
          </button>
        </div>

        <div className="">
          <p className="text-[0.75rem] font-semibold text-gray-500">
            Copy from another view
          </p>
        </div>
      </div>
    </div>
  );
}
