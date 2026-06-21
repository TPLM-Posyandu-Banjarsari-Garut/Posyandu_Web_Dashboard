import { z } from "zod";

export default z.object({ "email": z.string().email(), "otp": z.string(), "password": z.string().regex(new RegExp("^(?=.*[a-zA-Z])(?=.*\\d).+$")).min(8).max(100) });
