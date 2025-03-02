"use client";

import { api } from "~/trpc/react";
import { BaseCard } from "./baseCard";

export function Bases() {
    const { data: bases, refetch } = api.base.getBases.useQuery();

    if (!bases) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <span className="text-gray-400">Loading...</span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-5 gap-3 mt-2">
            {bases?.map((base) => (
                <BaseCard key={base.id} baseName={base.name} baseId={base.id}/>
            ))}
        </div>
    )
}