import { z } from "zod";

const fkOpcional = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`)
    .optional();

// `foto BYTEA` se omite del API (mismo criterio que estudiantes).
const examenSchema = z.object({
  id_convocatoria: fkOpcional("id_convocatoria"),
  id_materia: fkOpcional("id_materia"),
});

export const createExamenSchema = examenSchema;
export const updateExamenSchema = examenSchema.partial();
