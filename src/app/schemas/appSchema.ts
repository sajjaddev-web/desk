import { z } from "zod";

export const AppSchema = z.object({
  email: z.string().email().max(255),
  name: z
    .string()
    .regex(/^[a-zA-Z\-]+$/)
    .max(100),
  password: z
    .string()
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,128}$/),
});
