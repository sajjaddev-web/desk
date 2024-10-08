import { z } from "zod";

export const AppRegisterSchema = z.object({
  email: z.string().email().max(255),
  name: z
    .string()
    .regex(/^[a-zA-Z\-]+$/)
    .max(100),
  password: z
    .string()
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,128}$/),
});

export const activationSchema = z.object({
  token: z.string(),
});

export const AppLoginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const AppUpdateSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z\-]+$/)
    .max(100)
    .optional(),
  password: z
    .string()
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,128}$/)
    .optional(),
});
