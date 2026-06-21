'use client'

import { CaretUpDownIcon, GearIcon, SignOutIcon } from '@phosphor-icons/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from '@/components/ui/sidebar'

import { useLogout, useSession } from '@/hooks/use-auth'

export function NavUser() {
    const { data: sessionData, isLoading } = useSession()
    const { isMobile } = useSidebar()
    const logout = useLogout()

    const handleLogout = async () => {
        try {
            await logout.mutateAsync()
        } catch (err) {
            console.error('Logout failed:', err)
            globalThis.location.href = '/'
        }
    }

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size='lg'
                        className='pointer-events-none opacity-50'
                    >
                        <div className='h-8 w-8 rounded-lg bg-sidebar-foreground/10 animate-pulse' />
                        <div className='grid flex-1 gap-1 text-left text-sm leading-tight'>
                            <div className='h-4 w-20 rounded bg-sidebar-foreground/10 animate-pulse' />
                            <div className='h-3 w-28 rounded bg-sidebar-foreground/10 animate-pulse' />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    const user = sessionData?.user
    if (!user) return null

    const name = user.name || 'Admin'
    const email = user.email || ''
    const avatar = user.image || ''
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                <AvatarImage src={avatar} alt={name} />
                                <AvatarFallback className='rounded-lg'>
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-medium'>
                                    {name}
                                </span>
                                <span className='truncate text-xs'>
                                    {email}
                                </span>
                            </div>
                            <CaretUpDownIcon className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-fit'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={avatar} alt={name} />
                                    <AvatarFallback className='rounded-lg'>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-medium'>
                                        {name}
                                    </span>
                                    <span className='truncate text-xs'>
                                        {email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <GearIcon />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={handleLogout}
                            className='text-red-600 focus:text-red-600 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-red-950/30'
                        >
                            <SignOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
