'use client'

import { useState } from 'react'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import {
    columns,
    type Posyandu
} from '@/components/tables/posyandus-column-table'

const mockPosyandus: Posyandu[] = [
    {
        id: '1',
        name: 'Posyandu Melati I',
        address_line: 'Jl. Raya Banjarsari No. 12',
        rt: '02',
        rw: '04',
        village_name: 'Banjarsari',
        contact_number: '081299887766',
        status: 'active'
    },
    {
        id: '2',
        name: 'Posyandu Mawar II',
        address_line: 'Kp. Cigoler RT 03 RW 01',
        rt: '03',
        rw: '01',
        village_name: 'Banjarsari',
        contact_number: null,
        status: 'active'
    },
    {
        id: '3',
        name: 'Posyandu Anggrek III',
        address_line: 'Perumahan Banjarsari Indah Blok B5',
        rt: '01',
        rw: '05',
        village_name: 'Banjarsari',
        contact_number: '085711223344',
        status: 'inactive'
    }
]

export default function PosyandusPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedItems: Posyandu[]) => {
        const names = selectedItems.map(p => p.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Posyandu'
                subtitle='Manage Posyandu posts and locations data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockPosyandus}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                    onDelete={handleDelete}
                    config={{
                        enableSorting: true,
                        enableFiltering: true,
                        enableColumnVisibility: true
                    }}
                />
            </section>
        </>
    )
}
