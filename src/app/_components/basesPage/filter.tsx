import { Column } from "@tanstack/react-table";
import DebouncedInput from "./DebouncedInput";

export default function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" ? (
    <div>
      <div className="flex">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) => {
            column.setFilterValue((old: [number, number]) => [value, old?.[1]]);
          }}
          placeholder={`Min`}
          className="max-w-24 rounded border shadow z-10 flex-auto w-0"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) => {
            column.setFilterValue((old: [number, number]) => [old?.[0], value]);
          }}
          placeholder={`Max`}
          className="max-w-24 rounded border shadow flex-auto w-0"
        />
      </div>
      <div className="h-1"></div>
    </div>
  ) : (
    <DebouncedInput
      type="text"
      className="w-36 rounded border shadow"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      value={(columnFilterValue ?? '') as string}
    />
  );
}
