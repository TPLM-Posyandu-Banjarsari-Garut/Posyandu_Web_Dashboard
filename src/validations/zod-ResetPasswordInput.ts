import { z } from 'zod'

export default z.object({
    newPassword: z
        .string()
        .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
        .min(8)
        .max(100),
    token: z.string().optional()
})
