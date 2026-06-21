'use client'

import { usePathname } from 'next/navigation'
import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const segmentMap: Record<string, string> = {
    dashboard: 'Dashboard',
    master: 'Master Data',
    posyandus: 'Posyandu',
    users: 'Users',
    midwifes: 'Midwives',
    cadres: 'Cadres',
    parents: 'Parents',
    childrens: 'Children',
    services: 'Services',
    'examination-schedules': 'Examination Schedules',
    examinations: 'Examinations',
    consultations: 'Consultations',
    'medical-records': 'Medical Records',
    'examination-records': 'Examination Records',
    'pregnancy-records': 'Pregnancy Records',
    'nutrition-records': 'Nutrition Records',
    'immunization-records': 'Immunization Records',
    'vitamin-records': 'Vitamin Records',
    'kipi-details': 'KIPI Details',
    inventory: 'Inventory',
    inventories: 'Inventory',
    vaccines: 'Vaccines',
    vitamins: 'Vitamins',
    'education-information': 'Education & Information',
    educations: 'Education',
    'education-categories': 'Education Categories',
    medias: 'Media',
    others: 'Others',
    notifications: 'Notifications',
    create: 'Create',
    edit: 'Edit'
}

function getSegmentTitle(
    segment: string,
    _index: number,
    _pathSegments: string[]
): string {
    if (segmentMap[segment]) {
        return segmentMap[segment]
    }

    const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            segment
        )
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(segment)
    const isNumeric = /^\d+$/.test(segment)
    const isCuid = /^c[a-z0-9]{24}$/i.test(segment)
    const isLikelyId =
        isUuid ||
        isMongoId ||
        isNumeric ||
        isCuid ||
        (segment.length > 15 && !segment.includes('-'))

    if (isLikelyId) {
        return 'Detail'
    }

    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function Header() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    return (
        <header className='flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-6 w-full'>
                <SidebarTrigger className='-ml-1' />
                <Separator orientation='vertical' className='mr-2' />
                <Breadcrumb>
                    <BreadcrumbList>
                        {pathSegments.map((segment, index) => {
                            const isLast = index === pathSegments.length - 1
                            const href = `/${pathSegments.slice(0, index + 1).join('/')}`
                            const title = getSegmentTitle(
                                segment,
                                index,
                                pathSegments
                            )

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbItem
                                        className={
                                            isLast ? '' : 'hidden md:block'
                                        }
                                    >
                                        {isLast ? (
                                            <BreadcrumbPage>
                                                {title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={href}>
                                                {title}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && (
                                        <BreadcrumbSeparator className='hidden md:block' />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}
