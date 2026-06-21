// cspell:ignore posyandus midwifes childrens kipi
import {
    Archive,
    Bell,
    BookOpen,
    Database,
    Notebook,
    Stethoscope
} from '@phosphor-icons/react'

export const data = {
    navMain: [
        {
            title: 'Master Data',
            url: '#',
            icon: <Database />,
            isActive: true,
            items: [
                { title: 'Posyandu', url: '/posyandus' },
                { title: 'Users', url: '/users' },
                { title: 'Midwives', url: '/midwifes' },
                { title: 'Cadres', url: '/cadres' },
                { title: 'Parents', url: '/parents' },
                { title: 'Children', url: '/childrens' }
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
        },
        {
            title: 'Others',
            url: '#',
            icon: <Bell />,
            items: [{ title: 'Notifications', url: '/notifications' }]
        }
    ]
}
