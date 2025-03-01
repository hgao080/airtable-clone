import { flexRender, Row } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";

interface TableBodyRowProps {
  row: Row<any>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

export default function TableBodyRow({
  row,
  virtualRow,
  rowVirtualizer,
}: TableBodyRowProps) {
  return (
    <tr
      data-index={virtualRow.index}
      ref={(node) => rowVirtualizer.measureElement(node)}
      key={row.id}
      style={{ transform: `translateY(${virtualRow.start}px)` }}
      className="absolute flex w-full"
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            style={{ width: cell.column.getSize() }}
            className="flex border h-8"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
