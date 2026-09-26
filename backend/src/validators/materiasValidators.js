import { z } from "zod";

const materiaSchema = z.object({
  nombre_materia: z
    .string({ required_error: "El nombre de la materia es obligatorio" })
    .trim()
    .min(1, "El nombre de la materia es obligatorio")
    .max(150, "El nombre de la materia debe tener máximo 150 caracteres"),
});

export const createMateriaSchema = materiaSchema;
export const updateMateriaSchema = materiaSchema.partial();
