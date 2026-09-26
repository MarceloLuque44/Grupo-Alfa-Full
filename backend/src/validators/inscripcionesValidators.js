import { z } from "zod";

const fkOpcional = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`)
    .optional();

const inscripcionSchema = z.object({
  id_administrativo: fkOpcional("id_administrativo"),
  id_estudiante: fkOpcional("id_estudiante"),
  como_se_entero_de_nosotros: z
    .string()
    .trim()
    .max(255, "Debe tener máximo 255 caracteres")
    .optional(),
  recalculo: z.boolean().optional(),
  preparacion_previa: z.boolean().optional(),
  tiempo_de_preparacion_meses: z.coerce
    .number({ invalid_type_error: "El tiempo de preparación debe ser numérico" })
    .int("El tiempo de preparación debe ser un entero")
    .min(0, "El tiempo de preparación no puede ser negativo")
    .optional(),
  lugar_de_preparacion: z
    .string()
    .trim()
    .max(255, "Debe tener máximo 255 caracteres")
    .optional(),
});

export const createInscripcionSchema = inscripcionSchema;
export const updateInscripcionSchema = inscripcionSchema.partial();
