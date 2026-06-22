export interface TrashItem {
    id: string
    type:
        | 'user'
        | 'children'
        | 'posyandu'
        | 'education'
        | 'education_category'
        | 'vaccine'
        | 'vitamin'
        | 'pregnancy_record'
        | 'nutrition_record'
        | 'vitamin_record'
        | 'immunization_record'
        | 'kipi_detail'
        | 'examination_schedule'
        | 'examination_record'
        | 'examination'
        | 'inventory'
    name: string
    deleted_at: string
    details: Record<string, unknown>
}

export interface TrashQueryFilters {
    type?: TrashItem['type']
    search?: string
    page?: number | string
    limit?: number | string
    order?: 'asc' | 'desc'
}
