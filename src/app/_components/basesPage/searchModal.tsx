import { IoCloseOutline } from "react-icons/io5";

interface SearchModalProps {
  searchQuery: string;
  onSearchChange: (newQuery: string) => void;
  handleCloseSearchModal: () => void;
}

export default function SearchModal({
  searchQuery,
  onSearchChange,
  handleCloseSearchModal,
}: SearchModalProps) {
  return (
    <div className="flex absolute right-0 top-9 border-2 border-gray-300 z-50 bg-white p-2 min-w-[18rem] rounded-sm shadow-sm">
      <input
        type="text"
        placeholder="Find in view"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="text-[0.75rem] focus:outline-none flex-auto"
      />
      <button onClick={handleCloseSearchModal}>
        <IoCloseOutline />
      </button>
    </div>
  );
}
