import { auth } from "~/server/auth";

import { Header } from "../_components/basesPage/header";
import TablesView from "../_components/basesPage/tablesView";

export default async function Page() {
    const session = await auth();

  return (
    <div className="flex flex-col h-screen">
      <Header user={session?.user}/>
      <TablesView />
    </div>
  );
}
