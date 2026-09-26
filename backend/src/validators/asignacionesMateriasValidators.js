import { z } from "zod";

const fk = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`);

const asignacionMateriasSchema = z.object({
  id_materia: fk("id_materia"),
  id_curso_capacitacion: fk("id_curso_capacitacion"),
});

export const createAsignacionMateriasSchema = asignacionMateriasSchema;
export const updateAsignacionMateriasSchema = asignacionMateriasSchema.partial();
