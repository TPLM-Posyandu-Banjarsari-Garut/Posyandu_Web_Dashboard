import { z } from 'zod'

export default z.object({
    immunization_record_id: z.string().min(1),
    symptoms: z.string().min(3),
    severity: z.enum(['mild', 'moderate', 'severe']),
    action_taken: z.string().nullable().optional(),
    referred: z.boolean().default(false)
})
