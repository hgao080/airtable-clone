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
import { useEffect, useRef, useState } from "react";
import SortModal from "./sortModal";

import VisiblityModal from "./visibilityModal";
import FilterModal from "./filterModal";
import { Column, Row, View } from "@prisma/client";

interface ToolbarProps {
  selectedTable: string;
  allColumns: Column[];
  searchQuery: string;
  onSearchChange: (newQuery: string) => void;
  selectedView: View;
  setSelectedView: (newView: View) => void;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
  refetchViews: () => void;
  isViewsModalOpen: boolean;
  setIsViewsModalOpen: (isOpen: boolean) => void;
  refetchColumns: () => void;
  localColumns: Column[];
  setLocalColumns: (newColumns: Column[]) => void;
}

export default function Toolbar({
  selectedTable,
  allColumns,
  searchQuery,
  onSearchChange,
  selectedView,
  setSelectedView,
  isViewsModalOpen,
  setIsViewsModalOpen,
  localViews,
  setLocalViews,
  refetchViews,
  refetchColumns,
  localColumns,
  setLocalColumns,
}: ToolbarProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const filterModalRef = useRef<HTMLDivElement>(null);
  const sortModalRef = useRef<HTMLDivElement>(null);
  const columnModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSortModalOpen || isVisibilityModalOpen || isFilterModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortModalOpen, isVisibilityModalOpen, isFilterModalOpen]);

  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    onSearchChange("");
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      (sortModalRef.current &&
        !sortModalRef.current.contains(e.target as Node)) ||
      (columnModalRef.current &&
        !columnModalRef.current.contains(e.target as Node)) ||
      (filterModalRef.current &&
        !filterModalRef.current.contains(e.target as Node))
    ) {
      setIsSortModalOpen(false);
      setIsVisibilityModalOpen(false);
      setIsFilterModalOpen(false);
    }
  };

  return (
    <div className="flex justify-between border-b border-gray-300 px-3 py-2">
      <div className="flex items-center">
        <button onClick={() => setIsViewsModalOpen(!isViewsModalOpen)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[0.75rem] font-medium hover:bg-gray-100 ${isViewsModalOpen ? "bg-gray-100" : ""}`}>
          <LuMenu
            size={20}
            className="w-[1rem] translate-y-[-1px] text-gray-600"
          />
          Views
        </button>

        <div className="mx-3 h-[60%] w-[1px] bg-gray-300"></div>

        <div className="flex gap-2 text-gray-600">
          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <HiOutlineTable size={18} className="text-blue-700" />
            <p className="text-[0.75rem] font-medium">Grid View</p>
            <img src="/people.png" alt="" width={24} height={0} />
            <SlArrowDown size={10} />
          </button>
          <div className="relative flex items-center">
            <button
              onClick={() => setIsVisibilityModalOpen(true)}
              className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100"
            >
              <BsEyeSlash size={16} className="" />
              <p className="text-[0.75rem] font-medium">Hide Fields</p>
            </button>
            {isVisibilityModalOpen && (
              <VisiblityModal
                ref={columnModalRef}
                allColumns={allColumns ?? []}
                selectedView={selectedView}
                setSelectedView={setSelectedView}
                localViews={localViews}
                setLocalViews={setLocalViews}
              />
            )}
          </div>

          <div className="relative flex items-center">
            <button
              onClick={() => {
                setIsFilterModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100"
            >
              <IoFilterSharp size={14} className="" />
              <p className="text-[0.75rem] font-medium">Filter</p>
            </button>
            {isFilterModalOpen && <FilterModal
              ref={filterModalRef}
              allColumns={allColumns}
              localViews={localViews}
              setLocalViews={setLocalViews}
              selectedView={selectedView}
              setSelectedView={setSelectedView}
            />}
          </div>

          <button className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100">
            <CiViewList size={16} className="" />
            <p className="text-[0.75rem] font-medium">Group</p>
          </button>
          <div className="relative flex items-center">
            <button
              onClick={() => setIsSortModalOpen(true)}
              className="flex items-center gap-1 rounded-md px-2 py-[0.1rem] hover:bg-gray-100"
            >
              <TbArrowsSort size={16} className="scale-x-[-1]" />
              <p className="text-[0.75rem] font-medium">Sort</p>
            </button>
            {isSortModalOpen && (
              <SortModal
              selectedTable={selectedTable}
                ref={sortModalRef}
                allColumns={allColumns}
                selectedView={selectedView}
                setSelectedView={setSelectedView}
                localViews={localViews}
                setLocalViews={setLocalViews}
              />
            )}
          </div>

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
        <button onClick={handleOpenSearchModal} className="">
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
