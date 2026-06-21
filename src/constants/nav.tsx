// cspell:ignore posyandus midwifes childrens kipi
import {
    Archive,
    Bell,
    BookOpen,
    Database,
    House,
    Notebook,
    Stethoscope
} from '@phosphor-icons/react'

export const data = {
    navMain: [
        {
            title: 'Home',
            url: '/dashboard',
            icon: <House />
        },
        {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: <Bell />,
            badge: 3
        },
        {
            title: 'Master Data',
            url: '#',
            icon: <Database />,
            isActive: true,
            items: [
                { title: 'Posyandu', url: '/dashboard/posyandus' },
                { title: 'Users', url: '/dashboard/users' },
                { title: 'Midwifes', url: '/dashboard/midwifes' },
                { title: 'Cadres', url: '/dashboard/cadres' },
                { title: 'Parents', url: '/dashboard/parents' },
                { title: 'Children', url: '/dashboard/childrens' }
            ]
        },
        {
            title: 'Services',
            url: '#',
            icon: <Stethoscope />,
            items: [
                {
                    title: 'Examination Schedules',
                    url: '/examination-schedules'
                },
                { title: 'Examinations', url: '/examinations' },
                { title: 'Consultations', url: '/consultations' }
            ]
        },
        {
            title: 'Medical Records',
            url: '#',
            icon: <Notebook />,
            items: [
                { title: 'Examination Records', url: '/examination-records' },
                { title: 'Pregnancy Records', url: '/pregnancy-records' },
                { title: 'Nutrition Records', url: '/nutrition-records' },
                { title: 'Immunization Records', url: '/immunization-records' },
                { title: 'Vitamin Records', url: '/vitamin-records' },
                { title: 'KIPI Details', url: '/kipi-details' }
            ]
        },
        {
            title: 'Inventory',
            url: '#',
            icon: <Archive />,
            items: [
                { title: 'Inventory', url: '/inventories' },
                { title: 'Vaccines', url: '/vaccines' },
                { title: 'Vitamins', url: '/vitamins' }
            ]
        },
        {
            title: 'Education & Information',
            url: '#',
            icon: <BookOpen />,
            items: [
                { title: 'Education', url: '/educations' },
                { title: 'Education Categories', url: '/education-categories' },
                { title: 'Media', url: '/medias' }
            ]
        }
    ]
}
