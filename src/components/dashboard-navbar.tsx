import Link from 'next/link'
import { createClient } from '../../supabase/server'
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
import DashboardNavbarClient from './dashboard-navbar-client'

export default async function DashboardNavbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check user role if authenticated
  let userRole = null
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    userRole = profileData?.role || 'free'
  }

  return <DashboardNavbarClient userRole={userRole} />
}
