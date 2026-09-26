import { z } from "zod";

const fkOpcional = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`)
    .optional();

const avanceSchema = z.object({
  id_clase: fkOpcional("id_clase"),
  id_tema: fkOpcional("id_tema"),
});

export const createAvanceSchema = avanceSchema;
export const updateAvanceSchema = avanceSchema.partial();
