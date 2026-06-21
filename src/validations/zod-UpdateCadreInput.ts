import { z } from "zod";

export default z.object({ "user_id": z.string().min(1).optional(), "posyandu_id": z.string().min(1).optional(), "identity_number": z.string().max(16).nullable().optional(), "position": z.enum(["leader","secretary","treasurer","member"]).default("member"), "is_primary_assignment": z.boolean().default(true), "duty_area_notes": z.string().nullable().optional(), "status": z.enum(["active","inactive","disabled","pending_verification"]).default("active") });
