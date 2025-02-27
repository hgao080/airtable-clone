"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { SlArrowDown } from "react-icons/sl";
import { IoHelpCircleOutline } from "react-icons/io5";
import { PiBell } from "react-icons/pi";

import { api } from "~/trpc/react";

interface HeaderProps {
  userImage: string | null | undefined;
}

export function Header({ userImage }: HeaderProps) {
  const searchParams = useSearchParams();
  const baseId = searchParams.get("baseId");

  const [base] = baseId
    ? api.base.getBase.useSuspenseQuery({ baseId })
    : [null];

  return (
    <header className="flex h-[56px] w-full bg-rose-600">
      <nav className="flex w-full items-center justify-between p-5 pr-3">
        <div className="flex flex-auto gap-5">
          <div className="flex items-center gap-4">
            <Image
              src="/airtableWhite.png"
              alt="Airtable Icon"
              className="h-[18px]"
              width={22}
              height={1}
            />
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
          <button className="flex items-center gap-1 rounded-full px-3 py-1 hover:bg-rose-700">
            <IoHelpCircleOutline size={16} className="text-white" />
            <p className="text-[0.8rem] text-white">Help</p>
          </button>

          <button className="rounded-full border bg-gray-100 p-[0.4rem] hover:bg-white">
            <PiBell size={16} className="translate-y-[1px] text-rose-600" />
          </button>

          <img
            src={userImage || ""}
            alt=""
            className="aspect-square h-auto w-[30px] rounded-full border hover:cursor-pointer"
          />
        </div>
      </nav>
    </header>
  );
}
