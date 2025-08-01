import DashboardNavbar from "@/components/dashboard-navbar";
import { InfoIcon, UserCircle, Search, Clock, BookmarkIcon, History, Settings, BarChart } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-600 mt-1">
                  {user.email}
                </p>
              </div>
              <div className="hidden sm:block">
                <Button variant="outline" asChild>
                  <Link href="/search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>New Search</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent Searches */}
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-lg">Recent Searches</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm">Effects of climate change on biodiversity</p>
                  <p className="text-xs text-gray-500 mt-1">July 28, 2025</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm">Machine learning in healthcare</p>
                  <p className="text-xs text-gray-500 mt-1">July 25, 2025</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View all searches
              </Button>
            </Card>
            
            {/* Saved Articles */}
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BookmarkIcon className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="font-semibold text-lg">Saved Articles</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm">Neural networks for disease prediction</p>
                  <p className="text-xs text-gray-500 mt-1">3 references</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                Manage saved articles
              </Button>
            </Card>
            
            {/* Usage Stats */}
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BarChart className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="font-semibold text-lg">Usage Statistics</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Searches this month</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">References accessed</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">PDFs downloaded</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Premium Plan</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </Card>
            
            {/* Account Details */}
            <Card className="p-5 hover:shadow-md transition-shadow lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <UserCircle className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="font-semibold text-lg">Account Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account type</p>
                  <p className="font-medium">Premium User</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member since</p>
                  <p className="font-medium">June 7, 2025</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
