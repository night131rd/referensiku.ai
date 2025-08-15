import Link from "next/link";
import { createClient } from "../../supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

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
            <Link href="/dashboard" className="px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50">
              Dashboard
            </Link>
          ) : (
            <>
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
