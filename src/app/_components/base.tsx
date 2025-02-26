"use client";

import { api } from "~/trpc/react";

export function Base() {
  const { data: bases, refetch } = api.base.getBases.useQuery();

  const createBase = api.base.createBase.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h1 className="text-center underline">Bases</h1>
      {bases?.map((base) => <p key={base.id}>{base.name}</p>)}
      <button
        onClick={() => createBase.mutate({ name: "Untitled Base" })}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createBase.isPending}
      >
        Create Base
      </button>
    </div>
  );
}
