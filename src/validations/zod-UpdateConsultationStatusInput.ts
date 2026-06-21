import { z } from "zod";

export default z.object({ "status": z.enum(["pending","confirmed","completed","cancelled","rescheduled"]), "cancellation_reason": z.string().nullable().optional(), "notes": z.string().nullable().optional(), "duration_minutes": z.number().int().nullable().optional(), "follow_up_required": z.boolean().default(false), "follow_up_date": z.string().date().optional() });
