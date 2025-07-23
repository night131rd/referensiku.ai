import { createClient } from "../../supabase/server";
import Sidebar from "./sidebar";

export default async function SidebarServer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return <Sidebar user={user} />;
}
