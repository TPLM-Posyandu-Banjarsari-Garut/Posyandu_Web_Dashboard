'use client'

import { CaretRightIcon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar'

export function NavMain({
    items,
    label = 'Platform',
    className
}: Readonly<{
    items: {
        title: string
        url: string
        icon?: React.ReactNode
        isActive?: boolean
        badge?: string | number
        items?: {
            title: string
            url: string
        }[]
    }[]
    label?: string
    className?: string
}>) {
    return (
        <SidebarGroup className={className}>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map(item => {
                    const hasSubItems = item.items && item.items.length > 0
                    if (!hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <a
                                        href={item.url}
                                        className='flex items-center w-full'
                                    >
                                        {item.icon}
                                        <span>{item.title}</span>
                                        {item.badge !== undefined && (
                                            <Badge className='ml-auto rounded-full! bg-[#4f70f4] hover:bg-[#4f70f4] text-white border-none shadow-none font-semibold text-[11px] h-5 min-w-5 px-1.5 flex items-center justify-center group-data-[collapsible=icon]/sidebar-wrapper:hidden'>
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    }
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.isActive}
                            className='group/collapsible'
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                        <CaretRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map(subItem => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton asChild>
                                                    <a href={subItem.url}>
                                                        <span>
                                                            {subItem.title}
                                                        </span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
