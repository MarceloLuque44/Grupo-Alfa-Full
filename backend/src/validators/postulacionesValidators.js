import { z } from "zod";

const fk = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`);

const postulacionSchema = z.object({
  id_estudiante: fk("id_estudiante"),
  id_carrera: fk("id_carrera"),
});

export const createPostulacionSchema = postulacionSchema;
export const updatePostulacionSchema = postulacionSchema.partial();
