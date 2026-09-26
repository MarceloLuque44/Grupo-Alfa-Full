import { z } from "zod";

const temaSchema = z.object({
  nombre_tema: z
    .string({ required_error: "El nombre del tema es obligatorio" })
    .trim()
    .min(1, "El nombre del tema es obligatorio")
    .max(150, "El nombre del tema debe tener máximo 150 caracteres"),
  id_materia: z.coerce
    .number({ invalid_type_error: "El id_materia debe ser numérico" })
    .int("El id_materia debe ser un entero")
    .positive("El id_materia debe ser mayor a 0")
    .optional(),
});

export const createTemaSchema = temaSchema;
export const updateTemaSchema = temaSchema.partial();
