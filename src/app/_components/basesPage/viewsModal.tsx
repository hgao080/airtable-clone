import { GoSearch } from "react-icons/go";

import { api } from "~/trpc/react";

interface ViewsModalProps {
  views: any[];
  selectedView: string;
  setSelectedView: (viewId: string) => void;
}

export default function ViewsModal({ views, selectedView, setSelectedView }: ViewsModalProps) {
  
  return (
    <div className="flex min-w-[17.5rem] max-w-[18rem] flex-auto flex-col justify-between px-4 py-2">
      <div className="flex flex-col">
        <div className="flex items-center border-b border-gray-300 px-2">
          <GoSearch size={16} className="" />
          <input
            type="text"
            className="flex w-0 flex-auto px-4 py-1 outline-none"
          />
        </div>
        <div className="flex flex-auto mt-2">
          {views?.map((view) => (
            <button onClick={() => setSelectedView(view.id)} key={view.id} className={`flex flex-auto px-2 py-1 rounded-md hover:bg-blue-100 text-[0.8rem] ${selectedView === view.id ? "bg-blue-100" : ""}`}>
              {view.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="h-[1px] w-full bg-gray-300"></div>

        <h2 className="my-4 px-2 text-[1rem] font-medium">Create...</h2>

        <div className="flex flex-col">
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Grid</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Calendar</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Gallery</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Kanban</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Timeline</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">List</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Gantt</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">New Section</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </div>
        </div>

        <div className="my-4 h-[1px] w-full bg-gray-300"></div>

        <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
          <div className="">
            <p className="text-[0.8rem] font-medium">Form</p>
          </div>
          <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
        </div>
      </div>
    </div>
  );
}
