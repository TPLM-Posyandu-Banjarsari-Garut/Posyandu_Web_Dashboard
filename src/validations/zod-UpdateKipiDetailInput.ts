import { z } from 'zod'

export default z.object({
    immunization_record_id: z.string().min(1).optional(),
    symptoms: z.string().min(3).optional(),
    severity: z.enum(['mild', 'moderate', 'severe']).optional(),
    action_taken: z.string().nullable().optional(),
    referred: z.boolean().default(false)
})
