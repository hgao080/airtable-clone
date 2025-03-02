"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { SlArrowDown } from "react-icons/sl";
import { IoHelpCircleOutline } from "react-icons/io5";
import { PiBell } from "react-icons/pi";
import { VscHistory } from "react-icons/vsc";
import { GoPeople } from "react-icons/go";

import { api } from "~/trpc/react";
import Link from "next/link";
import ProfileModal from "../profileModal";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");

  const [base] = baseId
    ? api.base.getBase.useSuspenseQuery({ baseId })
    : [null];

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isProfileModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileModalOpen])

  const handleClickOutside = (e: MouseEvent) => {
    if (profileModalRef.current && !profileModalRef.current.contains(e.target as Node)) {
      setIsProfileModalOpen(false)
    }
  }

  return (
    <header className="flex h-[56px] w-full bg-rose-600">
      <nav className="flex w-full items-center justify-between p-5 pr-3">
        <div className="flex flex-auto gap-5">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/airtableWhite.png"
                alt="Airtable Icon"
                className="h-[18px]"
                width={22}
                height={1}
              />
            </Link>

            <div className="flex items-center gap-2 text-white">
              <h1 className="text-[1.05rem] font-bold">{base?.name}</h1>
              <SlArrowDown
                size={9}
                className="translate-x-[-1px] translate-y-[-1px] text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-white">
            <button className="rounded-full bg-rose-700 px-[0.7rem] py-1 text-[0.8rem] font-light shadow-inner">
              Data
            </button>
            <button className="rounded-full px-[0.7rem] py-1 text-[0.8rem] font-light hover:bg-rose-700">
              Automations
            </button>
            <button className="rounded-full px-[0.7rem] py-1 text-[0.8rem] font-light hover:bg-rose-700">
              Interfaces
            </button>
            <div className="h-[60%] w-[1px] bg-pink-50/10"></div>
            <button className="rounded-full px-[0.7rem] py-1 text-[0.8rem] font-light hover:bg-rose-700">
              Forms
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 pr-1">
          <button>
            <VscHistory size={14} className="text-white" />
          </button>

          <button className="flex items-center gap-1 rounded-full px-3 py-1 hover:bg-rose-700">
            <IoHelpCircleOutline size={16} className="text-white" />
            <p className="text-[0.8rem] text-white">Help</p>
          </button>

          <button className="flex items-center bg-rose-800 rounded-full px-3 py-2 gap-1">
            <p className="text-white text-[0.8rem]">Upgrade</p>
          </button>
          
          <button className="flex items-center bg-white rounded-full px-3 py-1 gap-1">
            <GoPeople size={16} className="text-rose-600" />
            <p className="text-rose-600 text-[0.8rem]">Share</p>
          </button>

          <button className="rounded-full border bg-gray-100 p-[0.4rem] hover:bg-white">
            <PiBell size={16} className="translate-y-[1px] text-rose-600" />
          </button>

          <div className="flex items-center relative">
            <button onClick={() => setIsProfileModalOpen(true)} className="">
              <img
                src={user.image ?? ""}
                alt=""
                className="aspect-square h-auto w-[30px] rounded-full border hover:cursor-pointer"
              />
            </button>
            {isProfileModalOpen && <ProfileModal ref={profileModalRef} user={user}/>}
          </div>
        </div>
      </nav>
    </header>
  );
}
