import { z } from 'zod'

export default z.object({
    parent_id: z.string().min(1).optional(),
    posyandu_id: z.string().min(1).optional(),
    midwife_id: z.string().nullable().optional(),
    pregnancy_status: z
        .enum([
            'first_trimester',
            'second_trimester',
            'third_trimester',
            'delivered'
        ])
        .default('first_trimester'),
    risk_level: z.enum(['low', 'moderate', 'high']).default('low'),
    last_menstrual_period: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional(),
    estimated_due_date: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional(),
    gravida: z.number().int().nullable().optional(),
    parity: z.number().int().nullable().optional(),
    abortus: z.number().int().nullable().optional(),
    is_active: z.boolean().default(true),
    notes: z.string().nullable().optional()
})
