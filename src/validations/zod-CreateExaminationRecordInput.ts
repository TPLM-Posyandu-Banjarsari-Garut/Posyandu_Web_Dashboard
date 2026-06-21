import { z } from 'zod'

export default z.object({
    examination_id: z.string().min(1),
    schedule_id: z.string().nullable().optional(),
    posyandu_id: z.string().min(1),
    children_id: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    cadre_id: z.string().min(1),
    midwife_id: z.string().min(1),
    examination_date: z.string().datetime({ offset: true }).nullable(),
    status: z
        .enum(['pending', 'processing', 'completed', 'cancelled'])
        .default('pending'),
    result_summary: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    medically_validated_at: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional(),
    medically_validated_by_midwife_id: z.string().nullable().optional()
})
