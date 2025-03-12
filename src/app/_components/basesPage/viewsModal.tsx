import { View } from "@prisma/client";
import { GoSearch } from "react-icons/go";

import { api } from "~/trpc/react";

interface ViewsModalProps {
  views: View[];
  setLocalViews: (newViews: any[]) => void;
  selectedView: View;
  setSelectedView: (view: View) => void;
  tableId: string;
}

export default function ViewsModal({
  views,
  selectedView,
  setSelectedView,
  tableId,
  setLocalViews,
}: ViewsModalProps) {

  const createView = api.view.createView.useMutation({
    onMutate: (newView) => {
      setLocalViews([...views, newView]);
    },
    onSuccess: (createdView) => {
      setLocalViews(
        views.map((view) =>
          view.name === createdView.name ? createdView : view
        )
      )
      setSelectedView(createdView);
    },
  });

  const handleCreateView = () => {
    createView.mutate({
      tableId: tableId,
      name: "View " + views.length,
    });
  };

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
        <div className="mt-2 flex flex-col flex-auto gap-1">
          {views?.map((view) => (
            <button
              onClick={() => {
                setSelectedView(view)
              }}
              key={view.name}
              className={`flex flex-auto rounded-md px-2 py-1 text-[0.8rem] hover:bg-blue-100 ${selectedView.id === view.id ? "bg-blue-100" : ""}`}
            >
              {view.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="h-[1px] w-full bg-gray-300"></div>

        <h2 className="my-4 px-2 text-[1rem] font-medium">Create...</h2>

        <div className="flex flex-col">
          <button onClick={handleCreateView} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
            <div className="">
              <p className="text-[0.8rem] font-medium">Grid</p>
            </div>
            <p className="my-[-5px] text-[1.5rem] text-gray-400">+</p>
          </button>
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
