import DashboardNavbar from "@/components/dashboard-navbar";
import { InfoIcon, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>This is a protected page only visible to authenticated users</span>
            </div>
          </header>

          {/* User Profile Section */}
          <div className="grid gap-6">
            <section className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
                <h2 className="text-xl font-semibold text-white">Your Profile</h2>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-slate-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user.user_metadata?.full_name || "User"}</h3>
                  <p className="text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                <pre className="text-xs font-mono max-h-48 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
