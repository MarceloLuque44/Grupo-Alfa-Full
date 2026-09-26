import { z } from "zod";

const estudianteSchema = z.object({
  id_usuario: z.coerce
    .number({ invalid_type_error: "El id_usuario debe ser numérico" })
    .int("El id_usuario debe ser un entero")
    .positive("El id_usuario debe ser mayor a 0"),
  id_apoderado: z.coerce
    .number({ invalid_type_error: "El id_apoderado debe ser numérico" })
    .int("El id_apoderado debe ser un entero")
    .positive("El id_apoderado debe ser mayor a 0")
    .optional(),
  colegio_de_procedencia: z
    .string()
    .trim()
    .max(150, "El colegio debe tener máximo 150 caracteres")
    .optional(),
  direccion_de_domicilio: z
    .string()
    .trim()
    .max(255, "La dirección debe tener máximo 255 caracteres")
    .optional(),
});

export const createEstudianteSchema = estudianteSchema;
export const updateEstudianteSchema = estudianteSchema.partial();
