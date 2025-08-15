'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home, Search, BookmarkIcon, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold flex items-center">
            <div className="mr-2">
              <img 
                src="/logo.png" 
                alt="ChatJurnal Logo" 
                className="h-7 w-auto"
              />
            </div>
            <span className="flex space-x-1 mr-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full inline-block"></span>
              <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
              <span className="h-2 w-2 bg-yellow-500 rounded-full inline-block"></span>
              <span className="h-2 w-2 bg-red-500 rounded-full inline-block"></span>
            </span>
            JurnalGPT
          </Link>
          <div className="hidden md:flex gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/saved" className="flex items-center gap-1">
                <BookmarkIcon className="h-4 w-4" />
                <span>Saved</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <Button variant="outline" size="sm" className="hidden md:flex" asChild>
            <Link href="/search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>New Search</span>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-gray-100">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/search" className="flex items-center gap-2 cursor-pointer">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut()
                router.refresh()
              }} className="flex items-center gap-2 cursor-pointer text-red-500">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
