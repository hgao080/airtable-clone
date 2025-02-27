import { SlArrowDown } from "react-icons/sl";
import { LuMenu } from "react-icons/lu";
import { PiGridFourLight } from "react-icons/pi";

export function Filters() {
  return (
    <div className="mt-5 flex w-full justify-between">
      <div className="flex gap-4 mt-1">
        <button className="flex items-center gap-2">
          <p className="text-[0.95rem] font-light text-gray-500 hover:text-black">
            Opened by you
          </p>
          <SlArrowDown size={8} className="translate-y-[-1px]" />
        </button>
        <button className="flex items-center gap-2">
          <p className="text-[0.95rem] font-light text-gray-500 hover:text-black">
            Show all types
          </p>
          <SlArrowDown size={8} className="translate-y-[-1px]" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button className="">
          <LuMenu size={20} className="text-gray-400 hover:text-black" />
        </button>

        <button className="bg-gray-200 rounded-full p-1">
          <PiGridFourLight size={20} className="" />
        </button>
      </div>
    </div>
  );
}
