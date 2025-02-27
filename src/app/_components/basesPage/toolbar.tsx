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

export default function Toolbar() {
  
  return (
    <div className="flex justify-between border-b border-gray-200 px-3 py-2">
      <div className="flex items-center">
        <div className="flex items-center gap-1 text-[0.75rem] font-medium rounded-md hover:bg-gray-100 px-2 py-1">
          <LuMenu size={20} className="text-gray-600 w-[1rem] translate-y-[-1px]" />
          Views
        </div>
        
        <div className="w-[1px] h-[60%] bg-gray-300 mx-3"></div>

        <div className="flex gap-2 text-gray-600">
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <HiOutlineTable size={18} className="text-blue-700" />
            <p className="text-[0.75rem] font-medium">Grid View</p>
            <img src="/people.png" alt="" width={24} height={0}/>
            <SlArrowDown size={10}/>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <BsEyeSlash size={16} className=""/>
            <p className="text-[0.75rem] font-medium">Hide Fields</p>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <IoFilterSharp size={14} className="" />
            <p className="text-[0.75rem] font-medium">Filter</p>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <CiViewList size={16} className="" />
            <p className="text-[0.75rem] font-medium">Group</p>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <TbArrowsSort size={16} className="scale-x-[-1] " />
            <p className="text-[0.75rem] font-medium">Sort</p>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <PiPaintBucket size={18} className="" />
            <p className="text-[0.75rem] font-medium">Color</p>
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <CgFormatLineHeight size={18} className="scale-x-[-1]" />
          </button>
          <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-[0.1rem] rounded-md">
            <GrShare size={12} className="" />
            <p className="text-[0.75rem] font-medium">Share and sync</p>
          </button>
        </div>
      </div>

      <button className="flex items-center">
        <CiSearch size={18} className="text-gray-600" />
      </button>
    </div>
  )
}