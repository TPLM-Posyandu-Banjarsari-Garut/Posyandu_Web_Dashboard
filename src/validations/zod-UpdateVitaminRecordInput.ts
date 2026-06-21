import { z } from 'zod'

export default z.object({
    children_id: z.string().min(1).optional(),
    vitamin_id: z.string().min(1).optional(),
    cadre_id: z.string().nullable().optional(),
    midwife_id: z.string().nullable().optional(),
    posyandu_id: z.string().nullable().optional(),
    distribution_period: z.enum(['february', 'august']).optional(),
    distribution_year: z.number().int().gt(0).optional(),
    date_given: z.string().date().optional(),
    status: z
        .enum(['not_yet', 'given', 'missed', 'sweeping'])
        .default('not_yet'),
    given_deworming: z.boolean().default(false),
    is_sweeping: z.boolean().default(false),
    is_received: z.boolean().nullable().optional(),
    location_type: z
        .union([
            z.literal('posyandu'),
            z.literal('puskesmas'),
            z.literal('pustu'),
            z.literal('home'),
            z.literal('school'),
            z.literal('paud'),
            z.literal('kindergarten'),
            z.literal('daycare'),
            z.literal(null)
        ])
        .nullable()
        .optional(),
    sync_status: z.enum(['pending', 'synced', 'failed']).default('pending'),
    external_ref_id: z.string().max(100).nullable().optional(),
    special_condition_notes: z.string().nullable().optional(),
    notes: z.string().nullable().optional()
})
