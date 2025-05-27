import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { User, UserCircle, Search } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="text-xl font-bold">
            AcademicSearch
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Search
            </Link>
            <Link
              href="/#features"
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Button>Dashboard</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
