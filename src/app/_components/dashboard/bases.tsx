"use client";

import { api } from "~/trpc/react";
import { BaseCard } from "./baseCard";

export function Bases() {
    const { data: bases } = api.base.getBases.useQuery();

    return (
        <div className="grid grid-cols-5 gap-3 mt-2">
            {bases?.map((base) => (
                <BaseCard key={base.id} baseName={base.name} baseId={base.id}/>
            ))}
        </div>
    )
}