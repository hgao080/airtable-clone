import { LuMenu } from "react-icons/lu";
import { HiOutlineTable } from "react-icons/hi";
import { SlArrowDown } from "react-icons/sl";
import { BsEyeSlash } from "react-icons/bs";
import { IoFilterSharp } from "react-icons/io5";
import { TbArrowsSort } from "react-icons/tb";
import { PiPaintBucket } from "react-icons/pi";
import { CgFormatLineHeight } from "react-icons/cg";
import { GrShare } from "react-icons/gr";
import { CiViewList, CiSearch } from "react-icons/ci";
import SearchModal from "./searchModal";
import { useState } from "react";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (newQuery: string) => void;
}

export default function Toolbar({ searchQuery, onSearchChange }: ToolbarProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    onSearchChange("");
  };

  return (
    <div className="flex justify-between border-b border-gray-300 px-3 py-2">
      <div className="flex items-center">
        <div className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.75rem] font-medium hover:bg-gray-100">
          <LuMenu
            size={20}
            className="w-[1rem] translate-y-[-1px] text-gray-600"
          />
          Views
        </div>

        <div className="mx-3 h-[60%] w-[1px] bg-gray-300"></div>

        <div className="flex gap-2 text-gray-600">
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <HiOutlineTable size={18} className="text-blue-700" />
            <p className="text-[0.75rem] font-medium">Grid View</p>
            <img src="/people.png" alt="" width={24} height={0} />
            <SlArrowDown size={10} />
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <BsEyeSlash size={16} className="" />
            <p className="text-[0.75rem] font-medium">Hide Fields</p>
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <IoFilterSharp size={14} className="" />
            <p className="text-[0.75rem] font-medium">Filter</p>
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <CiViewList size={16} className="" />
            <p className="text-[0.75rem] font-medium">Group</p>
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <TbArrowsSort size={16} className="scale-x-[-1]" />
            <p className="text-[0.75rem] font-medium">Sort</p>
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <PiPaintBucket size={18} className="" />
            <p className="text-[0.75rem] font-medium">Color</p>
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <CgFormatLineHeight size={18} className="scale-x-[-1]" />
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <GrShare size={12} className="" />
            <p className="text-[0.75rem] font-medium">Share and sync</p>
          </button>
        </div>  
      </div>

      <div className="relative flex items-center">
        <button
          onClick={handleOpenSearchModal}
          className=""
        >
          <CiSearch size={18} className="text-gray-600" />
        </button>
        {isSearchModalOpen && (
          <SearchModal
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            handleCloseSearchModal={handleCloseSearchModal}
          />
        )}
      </div>
    </div>
  );
}
