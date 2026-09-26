import { z } from "zod";

const rolSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre debe tener máximo 50 caracteres"),
});

export const createRolSchema = rolSchema;
export const updateRolSchema = rolSchema.partial();
