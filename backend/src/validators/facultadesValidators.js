import { z } from "zod";

const facultadSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre debe tener máximo 150 caracteres"),
});

export const createFacultadSchema = facultadSchema;
export const updateFacultadSchema = facultadSchema.partial();
