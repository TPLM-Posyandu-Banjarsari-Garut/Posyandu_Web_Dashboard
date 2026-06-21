import { z } from 'zod'

export default z.object({
    pregnancy_record_id: z.string().nullable().optional(),
    children_id: z.string().nullable().optional(),
    consultation_type: z
        .enum(['pregnancy', 'child_development', 'general'])
        .optional(),
    scheduled_at: z.string().datetime({ offset: true }).optional(),
    notes: z.string().nullable().optional()
})
