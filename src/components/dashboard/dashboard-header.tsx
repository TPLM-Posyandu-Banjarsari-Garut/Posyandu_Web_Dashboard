// cspell:ignore Sampurasun
import { HeartHalfIcon } from '@phosphor-icons/react'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar'

export function DashboardHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default hover:bg-transparent hover:text-sidebar-foreground'
                >
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                        <HeartHalfIcon className='size-5' weight='fill' />
                    </div>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                            Posyandu Dashboard
                        </span>
                        <span className='truncate text-xs'>
                            Sampurasun monitoring dashboard
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
