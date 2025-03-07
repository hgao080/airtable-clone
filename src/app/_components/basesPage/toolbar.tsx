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

import { ColumnFilter, SortingState } from "@tanstack/react-table";
import VisiblityModal from "./visibilityModal";
import FilterModal from "./filterModal";
import { Column, Row } from "@prisma/client";
import { InfiniteData, QueryObserverResult } from "@tanstack/react-query";

interface ToolbarProps {
  selectedTable: string;
  columns: Column[];
  searchQuery: string;
  onSearchChange: (newQuery: string) => void;
  sorting: SortingState;
  setSorting: (newSorting: SortingState) => void;
  localViews: any[];
  setLocalViews: (newViews: any[]) => void;
  refetchViews: () => void;
  setColumnVisibility: (newColumnVisibility: Record<string, boolean>) => void;
  selectedView: string | undefined;
  columnVisibility: Record<string, boolean>;
  columnFilters: ColumnFilter[];
  setColumnFilters: (newColumnFilters: ColumnFilter[]) => void;
  isViewsModalOpen: boolean;
  setIsViewsModalOpen: (isOpen: boolean) => void;
  refetchColumns: () => void;
  localColumns: Column[];
  setLocalColumns: (newColumns: Column[]) => void;
  localRows: Row[];
  setLocalRows: (newRows: Row[]) => void;
  refetchRows: () => void
}

export default function Toolbar({
  selectedTable,
  columns,
  searchQuery,
  onSearchChange,
  sorting,
  setSorting,
  setColumnVisibility,
  columnVisibility,
  columnFilters,
  setColumnFilters,
  isViewsModalOpen,
  setIsViewsModalOpen,
  selectedView,
  localViews,
  setLocalViews,
  refetchViews,
  refetchColumns,
  localColumns,
  setLocalColumns,
  localRows,
  setLocalRows,
  refetchRows,
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
                columns={columns ?? []}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                selectedView={selectedView ?? ""}
                localViews={localViews}
                setLocalViews={setLocalViews}
                refetchColumns={refetchColumns}
                localColumns={localColumns}
                setLocalColumns={setLocalColumns}
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
              selectedTable={selectedTable}
              ref={filterModalRef}
              columns={columns ?? []}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              localViews={localViews}
              setLocalViews={setLocalViews}
              selectedView={selectedView ?? ""}
              localRows={localRows}
              setLocalRows={setLocalRows}
              refetchRows={refetchRows}
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
                columns={columns ?? []}
                sorting={sorting}
                setSorting={setSorting}
                selectedView={selectedView ?? ""}
                localViews={localViews}
                setLocalViews={setLocalViews}
                refetchRows={refetchRows}
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
