import { type Row, type Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import TableBodyRow from "./tableBodyRow";

interface TableBodyProps {
  table: Table<any>;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  handleCreateRow: () => void;
  handleCreateKRows: () => void;
  isCreating: boolean;
}

export default function TableBody({
  table,
  tableContainerRef,
  handleCreateRow,
  handleCreateKRows,
  isCreating,
}: TableBodyProps) {
  const { rows } = table.getRowModel();
  const columns = table.getAllColumns();

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current!,
    measureElement:
      typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <tbody
      style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      className="relative grid"
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index]!;

        return (
          <TableBodyRow
            key={row.id}
            row={row}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
          />
        );
      })}
      <tr
        style={{ transform: `translateY(${rowVirtualizer.getTotalSize()}px)` }}
        className=""
      >
        {columns.map((column, index) => {
          if (index == 0 || index == 1) {
            return (
              <td
                key={column.id}
                style={{ width: column.getSize() }}
                className="border"
              >
                {index == 0 ? (
                  <button
                    onClick={handleCreateRow}
                    disabled={isCreating}
                    className="flex h-8 w-full items-center pl-2 text-start text-[1.75rem] text-gray-400"
                  >
                    +
                  </button>
                ) : null}
                {index == 1 ? (
                  <button
                    onClick={handleCreateKRows}
                    disabled={isCreating}
                    className="pl-2 font-[0.8rem] text-gray-400"
                  >
                    Add 100k
                  </button>
                ) : null}
              </td>
            );
          }

          return null;
        })}
      </tr>
    </tbody>
  );
}
