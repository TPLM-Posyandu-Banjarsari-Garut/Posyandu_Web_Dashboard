import { z } from "zod";

export default z.object({ "email": z.string().email(), "type": z.enum(["email-verification","sign-in","forget-password","change-email"]).default("email-verification") });
