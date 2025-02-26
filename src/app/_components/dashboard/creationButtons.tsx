import { PiStarFourBold, PiTableLight } from "react-icons/pi";
import { GoPlus, GoArrowUp } from "react-icons/go";
export function CreationButtons() {

    return (
        <div className="flex gap-4">
            <button className="flex flex-col flex-auto gap-1 border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2">
                    <PiStarFourBold size={16} className="text-pink-400 " />
                    <h2 className="text-[0.9rem] font-medium">Start with AI</h2>
                </div>
                <p className="text-gray-500 text-[0.8rem]">Turn your process into an app with data and interfaces using AI.</p>
            </button>

            <button className="flex flex-col flex-auto gap-1 border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2">   
                    <div className="border border-purple-950">
                        <GoPlus size={22} className="text-purple-950 m-[-5px]" />
                    </div>
                    <h2 className="text-[0.9rem] font-medium">Start with templates</h2>
                </div>
                <p className="text-gray-500 text-[0.8rem]">Select a template to get started and customize as you go.</p>
            </button>

            <button className="flex flex-col flex-auto gap-1 border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2">
                    <GoArrowUp size={20} className="text-emerald-600 " />
                    <h2 className="text-[0.9rem] font-medium">Quickly Upload</h2>
                </div>
                <p className="text-gray-500 text-[0.8rem]">Easily migrate your existing projects in just a few minutes.</p>
            </button>

            <button className="flex flex-col flex-auto gap-1 border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2">
                    <PiTableLight size={20} className="text-blue-800 " />
                    <h2 className="text-[0.9rem] font-medium">Start from scratch</h2>
                </div>
                <p className="text-gray-500 text-[0.8rem]">Create a new blank base with custom tables, fields, and views.</p>
            </button>
        </div>
    )
}