import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Base } from "./_components/base";
import { Header } from "./_components/dashboard/header";
import { Sidebar } from "./_components/dashboard/sidebar";
import { CreationButtons } from "./_components/dashboard/creationButtons";
import { Filters } from "./_components/dashboard/filters";
import { Bases } from "./_components/dashboard/bases";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      {session?.user ? (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex flex-1 h-full">
            <Sidebar />
            <div className="flex flex-col flex-1 p-12 py-7 bg-gray-100">
              <h1 className="font-bold text-[1.7rem] mb-6">Home</h1>
              <CreationButtons />
              <Filters />
              <Bases />
            </div>
          </main>
        </div>
      ) : (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Welcome to AirTable
            </h1>
            <div className="flex flex-col items-center justify-center gap-4">
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </main>
      )}
    </HydrateClient>
  );
}
