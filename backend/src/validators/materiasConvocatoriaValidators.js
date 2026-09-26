import { z } from "zod";

const fk = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`);

const materiasConvocatoriaSchema = z.object({
  id_convocatoria: fk("id_convocatoria"),
  id_materia: fk("id_materia"),
});

export const createMateriasConvocatoriaSchema = materiasConvocatoriaSchema;
export const updateMateriasConvocatoriaSchema = materiasConvocatoriaSchema.partial();
