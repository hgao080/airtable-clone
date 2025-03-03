import { GoPerson, GoPeople, GoMail } from "react-icons/go";
import { PiBell, PiWrench, PiTrash } from "react-icons/pi";
import { IoLanguageOutline } from "react-icons/io5";
import { SlArrowRight } from "react-icons/sl";
import { MdOutlineStars } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import Link from "next/link";

interface profileModalProps {
  ref: React.RefObject<HTMLDivElement>;
  user: any;
}

export default function ProfileModal({ ref, user }: profileModalProps) {
  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 z-50 flex min-w-[18rem] flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-5 shadow-md"
    >
      <div className="flex flex-col">
        <h3 className="text-[0.75rem] font-semibold">{user.name}</h3>
        <p className="text-[0.75rem]">{user.email}</p>
      </div>

      <div className="h-[1px] w-full bg-gray-100"></div>

      <div className="mx-[-0.4rem] mt-[-0.5rem] flex flex-col">
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <GoPerson size={16} />
          <p className="text-start text-[0.8rem]">Account</p>
        </button>
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <GoPeople size={16} />
          <p className="text-start text-[0.8rem]">Manage Groups</p>
        </button>
        <button className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <PiBell size={16} />
            <p className="text-start text-[0.8rem]">Notification Preferences</p>
          </div>
          <SlArrowRight size={8} className="" />
        </button>
        <button className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <IoLanguageOutline size={16} />
            <p className="text-start text-[0.8rem]">Language Preferences</p>
          </div>
          <p className="text-[0.8rem]">
            <SlArrowRight size={8} />
          </p>
        </button>
      </div>

      <div className="h-[1px] w-full bg-gray-100"></div>

      <div className="mx-[-0.4rem] mt-[-0.5rem] flex flex-col">
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <GoMail size={14} />
          <p className="text-start text-[0.8rem]">Contact sales</p>
        </button>
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <MdOutlineStars size={16} className="translate-x-[-1px]" />
          <p className="text-start text-[0.8rem]">Upgrade</p>
        </button>
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <GoMail size={14} />
          <p className="text-start text-[0.8rem]">Tell a friend</p>
        </button>
      </div>

      <div className="h-[1px] w-full bg-gray-100"></div>

      <div className="mx-[-0.4rem] mt-[-0.5rem] flex flex-col">
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <IoIosLink size={16} />
          <p className="text-start text-[0.8rem]">Integrations</p>
        </button>
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <PiWrench size={16} className="translate-x-[-1px] scale-x-[-1]" />
          <p className="text-start text-[0.8rem]">Builder Hub</p>
        </button>
      </div>

      <div className="h-[1px] w-full bg-gray-100"></div>

      <div className="mx-[-0.4rem] mt-[-0.5rem] flex flex-col">
        <button className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <PiTrash size={16} />
          <p className="text-start text-[0.8rem]">Trash</p>
        </button>
        <Link href="/api/auth/signout" className="flex items-center justify-start gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
          <CiLogout size={16} className="translate-x-[-1px] scale-x-[-1]" />
          <p className="text-start text-[0.8rem]">Log out</p>
        </Link>
      </div>
    </div>
  );
}
