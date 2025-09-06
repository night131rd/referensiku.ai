import Link from "next/link";
import { createClient } from "../../supabase/server";
import UpgradeButton from "./upgrade-button";
import MobileMenu from "./mobile-menu";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // ✅ Menggunakan getUser() untuk keamanan

  // Check user role if authenticated
  let userRole = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    userRole = profileData?.role || 'free';
  }

  return (
    <nav className="w-full bg-white py-3 sm:py-4 border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-lg sm:text-xl font-bold flex items-center min-h-[44px]">
            <div className="mr-2">
              <img
                src="/header_logo.png"
                alt="ChatJurnal Logo"
                className="h-6 sm:h-7 w-auto"
              />
            </div>
            <span className="hidden sm:inline">JurnalGPT</span>
            <span className="sm:hidden">JG</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {userRole !== 'premium' && <UpgradeButton />}
              <Link href="/dashboard" className="px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <UpgradeButton />
              <Link href="/sign-in" className="px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileMenu user={user} userRole={userRole} />
        </div>
      </div>
    </nav>
  );
}
