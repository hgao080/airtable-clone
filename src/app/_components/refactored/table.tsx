import { Column } from "@prisma/client";

interface TableProps {
  tableId: string;
  rowData: any;
  localColumns: Column[];
  setLocalColumns: Column[];
}

export default function Table({
  tableId,
  rowData,
  localColumns,
  setLocalColumns,
} : TableProps) {

  return (
    
  )
}