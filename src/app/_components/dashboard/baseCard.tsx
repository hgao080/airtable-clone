interface BaseCardProps {
  baseName: string;
}

export function BaseCard({ baseName }: BaseCardProps) {
  return (
    <button className="flex flex-auto items-center gap-4 rounded-md border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md">
      <div className="flex aspect-square w-[3.5rem] items-center justify-center rounded-lg border border-rose-700 bg-rose-600 text-[1.3rem] text-white">
        {baseName.substring(0, 2)}
      </div>
      <div className="flex flex-col gap-1 justify-center items-start">
        <h2 className="text-[0.8rem] font-medium">{baseName}</h2>
        <p className="text-[0.7rem] font-light">Base</p>
      </div>
    </button>
  );
}
