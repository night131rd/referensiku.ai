'use client'
import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../../supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
            }
            setLoading(false)
        }
        
        loadUser()
    }, [supabase])

    if (loading) {
        return (
            <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                        <Avatar>
                            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || "User"} />
                            <AvatarFallback>{(user.user_metadata.full_name || "User").substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <UserCircle className="h-6 w-6" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {user && (
                    <>
                        <DropdownMenuLabel>
                            {user.user_metadata.full_name || user.user_metadata.name || user.email}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem onClick={async () => {
                    await supabase.auth.signOut()
                    router.refresh()
                    router.push('/sign-in')
                }}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}