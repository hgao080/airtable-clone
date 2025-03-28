"use client"

import Image from "next/image";
import Link from "next/link";
import { LuMenu } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import { PiBell } from "react-icons/pi";
import { IoHelpCircleOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import ProfileModal from "../profileModal";

interface HeaderProps {
  user: any
}

export function Header({ user } : HeaderProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isProfileModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileModalOpen]);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      profileModalRef.current &&
      !profileModalRef.current.contains(e.target as Node)
    ) {
      setIsProfileModalOpen(false);
    }
  };

  return (
    <header className="flex h-[56px] w-full border-b border-b-gray-300">
      <nav className="flex w-full justify-center px-[0.75rem]">
        <div className="flex flex-1 items-center gap-5">
          <button>
            <LuMenu size={20} className="text-gray-400 hover:text-gray-600" />
          </button>

          <Link href="/">
            <Image
              src="/airtableIcon.webp"
              alt="Airtable Logo"
              className="translate-y-[1px]"
              width={102}
              height={0}
            />
          </Link>
        </div>

        <div className="flex max-w-[22rem] flex-[0.75] items-center justify-between">
          <div className="flex h-[60%] flex-auto items-center justify-between rounded-full border border-gray-200 px-4 text-[0.8rem] shadow-sm hover:border-gray-300 hover:shadow-md">
            <div className="flex gap-2">
              <CiSearch size={17} className="translate-y-[1px] text-black" />
              <p className="translate-y-[1px] text-gray-800">Search...</p>
            </div>

            <p className="translate-y-[1px] text-gray-400">ctrl K</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 pr-1">
          <button className="flex items-center gap-1 rounded-full px-3 py-1 hover:bg-gray-200">
            <IoHelpCircleOutline size={16} className="text-black" />
            <p className="text-[0.8rem]">Help</p>
          </button>

          <button className="rounded-full border border-gray-200 p-[0.4rem] hover:bg-gray-200">
            <PiBell size={16} className="translate-y-[1px] text-black" />
          </button>

          <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center relative">
            <img
              src={user?.image ?? ""}
              alt=""
              className="aspect-square h-auto w-[30px] rounded-full hover:cursor-pointer"
            />
            {isProfileModalOpen && <ProfileModal ref={profileModalRef} user={user}/>}
          </div>
        </div>
      </nav>
    </header>
  );
}
