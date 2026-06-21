import { z } from 'zod'

export default z.object({
    children_id: z.string().min(1).optional(),
    vaccine_id: z.string().min(1).optional(),
    cadre_id: z.string().nullable().optional(),
    midwife_id: z.string().nullable().optional(),
    posyandu_id: z.string().nullable().optional(),
    inventory_id: z.string().nullable().optional(),
    dose_number: z.number().int().gt(0).optional(),
    date_given: z.string().date().optional(),
    batch_number: z.string().max(50).nullable().optional(),
    status: z
        .enum(['not_yet', 'scheduled', 'completed', 'missed'])
        .default('scheduled'),
    kipi_status: z.boolean().default(false),
    schedule_compliance: z
        .union([
            z.literal('on_time'),
            z.literal('late'),
            z.literal('non_compliant'),
            z.literal(null)
        ])
        .nullable()
        .optional(),
    status_dofu: z.boolean().default(false),
    sync_status: z.enum(['pending', 'synced', 'failed']).default('pending'),
    external_ref_id: z.string().max(100).nullable().optional(),
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
    notes: z.string().nullable().optional()
})
