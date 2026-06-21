import { z } from "zod";

export default z.object({ "name": z.string().min(3).max(100), "email": z.string().email().max(255), "password": z.string().regex(new RegExp("^(?=.*[a-zA-Z])(?=.*\\d).+$")).min(8).max(100), "phone_number": z.string().max(20).nullable().optional() });
