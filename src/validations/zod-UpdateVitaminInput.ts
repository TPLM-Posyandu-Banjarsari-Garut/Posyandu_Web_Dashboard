import { z } from 'zod'

export default z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(5).nullable().optional(),
    capsule_color: z.enum(['blue', 'red']).optional(),
    dosage_iu: z.number().int().gt(0).optional(),
    min_age_months: z.number().int().gt(0).nullable().optional(),
    max_age_months: z.number().int().gt(0).nullable().optional(),
    distributions_per_year: z.number().int().gt(0).nullable().optional(),
    target_age_months: z.number().int().gt(0).nullable().optional()
})
