import { z } from "zod";

const fk = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`);

const materiasAsesoresSchema = z.object({
  id_asesor: fk("id_asesor"),
  id_materia: fk("id_materia"),
});

export const createMateriasAsesoresSchema = materiasAsesoresSchema;
export const updateMateriasAsesoresSchema = materiasAsesoresSchema.partial();
