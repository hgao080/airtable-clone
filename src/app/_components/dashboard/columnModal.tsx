
interface ColumnModalProps {
  columnName: string;
  setColumnName: (value: string) => void;
  columnType: "TEXT" | "NUMBER";
  setColumnType: (value: "TEXT" | "NUMBER") => void;
  handleCloseColumnModal: () => void;
  handleModalCreateColumn: () => void;
}

export default function ColumnModal({ columnName, setColumnName, columnType, setColumnType, handleCloseColumnModal, handleModalCreateColumn} : ColumnModalProps) {
  return (
    <div className="absolute left-[-4px] top-8 z-10 w-[25rem] rounded-md border border-gray-300 bg-white p-4 shadow-lg">
      <input
        type="text"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        className="mb-4 w-full border rounded-lg p-1 pl-2 text-[0.8rem] font-light"
        placeholder="Field Name (Optional)"
      />
      <select
        value={columnType}
        onChange={(e) => {
          setColumnType(e.target.value as "TEXT" | "NUMBER")
        }}
        className="mb-4 w-full border p-1 text-[0.75rem] font-light rounded-md outline-none appearance-none hover:cursor-pointer"
      >
        <option value="TEXT">Single Line Text</option>
        <option value="NUMBER">Number</option>
      </select>

      <div className="flex justify-end items-center gap-2">
        <button
          onClick={handleCloseColumnModal}
          className="rounded hover:bg-gray-200 font-light text-[0.75rem] px-3 py-2"
        >
          Cancel
        </button>
        <button
          onClick={handleModalCreateColumn}
          className="rounded bg-blue-500 px-3 py-2 text-xs text-white"
        >
          Create Field
        </button>
      </div>
    </div>
  );
}
