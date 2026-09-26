import { z } from "zod";

const fkOpcional = (label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`)
    .optional();

const contenidoSchema = z.object({
  id_examen_de_ingreso: fkOpcional("id_examen_de_ingreso"),
  id_tema: fkOpcional("id_tema"),
});

export const createContenidoSchema = contenidoSchema;
export const updateContenidoSchema = contenidoSchema.partial();
