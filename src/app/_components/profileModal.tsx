
interface profileModalProps {
  ref: React.RefObject<HTMLDivElement>;
  user: any
}

export default function ProfileModal({ ref, user }: profileModalProps) {

  return (
    <div ref={ref} className="absolute right-0 top-9 z-50 flex min-w-[18rem] flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-5 shadow-md">
      <div className="flex flex-col">
        <h3 className="text-[0.75rem] font-semibold">{user.name}</h3>
        <p className="text-[0.75rem]">{user.email}</p>
      </div>
      <div className="w-full h-[1px] bg-gray-100 rounded-xl"></div>
      <div className="flex flex-col mt-[-0.5rem]">
        <button className="hover:bg-gray-100 px-4 py-1">
          <p className="text-[0.8rem] text-start">Account</p>
        </button>
        <button className="hover:bg-gray-100 px-4 py-1">
          <p className="text-[0.8rem] text-start">Manage Groups</p>
        </button>
        <button className="hover:bg-gray-100 px-4 py-1">
          <p className="text-[0.8rem] text-start">Notification Preferences</p>
        </button>
        <button className="hover:bg-gray-100 px-4 py-1">
          <p className="text-[0.8rem] text-start">Account</p>
        </button>
      </div>
    </div>
  )
}