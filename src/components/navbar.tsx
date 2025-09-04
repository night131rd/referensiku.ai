import Link from "next/link";
import { createClient } from "../../supabase/server";
import UpgradeButton from "./upgrade-button";

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
    <nav className="w-full bg-white py-4 border-b border-gray-100">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold flex items-center">
            <div className="mr-2">
              <img
                src="/logo.png"
                alt="ChatJurnal Logo"
                className="h-7 w-auto"
              />
            </div>
            JurnalGPT
          </Link>
        </div>


        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {userRole !== 'premium' && <UpgradeButton />}
              <Link href="/dashboard" className="px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <UpgradeButton />
              <Link href="/sign-in" className="text-gray-800 hover:text-gray-900">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
