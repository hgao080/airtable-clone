import { GoHome, GoBook } from "react-icons/go";
import { PiShoppingBagOpen } from "react-icons/pi";
import { TbWorld } from "react-icons/tb";
import { FiPlus } from "react-icons/fi";
import Image from "next/image";

export function Sidebar() {
  return (
    <div className="flex min-h-full flex-col items-center justify-between border-r border-r-gray-300 px-[0.5rem] py-[1.2rem] pb-0">
      <div className="flex flex-col items-center gap-4">
        <GoHome size={20} className="text-black" />
        <Image
          src="/people.png"
          alt="People Icon"
          className=""
          width={30}
          height={0}
        />
        <div className="h-[1px] w-[72%] border-t border-gray-200"></div>
      </div>

      <div className="flex flex-col gap-[1.1rem] items-center">
        <div className="h-[1px] w-[100%] border-t border-gray-200"></div>
        <GoBook size={14} className="text-gray-400" />
        <PiShoppingBagOpen size={16} className="text-gray-400" />
        <TbWorld size={16} className="text-gray-400" />
        <div className="border border-gray-400 p-[0.1rem] rounded-md">
            <FiPlus size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
