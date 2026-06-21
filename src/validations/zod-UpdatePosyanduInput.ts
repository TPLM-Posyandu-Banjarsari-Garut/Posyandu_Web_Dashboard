import { z } from "zod";

export default z.object({ "name": z.string().min(3).max(100).optional(), "address_line": z.string().min(5).nullable().optional(), "rt": z.string().max(5).nullable().optional(), "rw": z.string().max(5).nullable().optional(), "village_name": z.string().max(100).nullable().optional(), "contact_number": z.string().max(20).nullable().optional(), "status": z.enum(["active","inactive","disabled","pending_verification"]).default("active") });
