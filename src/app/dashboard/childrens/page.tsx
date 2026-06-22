'use client'

import { useState } from 'react'
import {
    type Child,
    columns
} from '@/components/columns-table/childrens-column-table'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'

const mockChildren: Child[] = [
    {
        id: '1',
        name: 'Gibran Rakabuming',
        identity_number: '3205010203040011',
        gender: 'male',
        child_category: 'toddler',
        birth_date: '2022-04-10'
    },
    {
        id: '2',
        name: 'Kahiyang Ayu',
        identity_number: '3205010203040012',
        gender: 'female',
        child_category: 'young_child',
        birth_date: '2023-08-15'
    },
    {
        id: '3',
        name: 'Jokowi Widodo',
        identity_number: '3205010203040013',
        gender: 'male',
        child_category: 'infant',
        birth_date: '2025-12-05'
    }
]

export default function ChildrensPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedItems: Child[]) => {
        const names = selectedItems.map(c => c.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Children'
                subtitle='Manage Posyandu children data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockChildren}
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
