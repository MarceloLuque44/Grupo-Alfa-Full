import { z } from "zod";

const fk = (name, label) =>
  z.coerce
    .number({ invalid_type_error: `El ${label} debe ser numérico` })
    .int(`El ${label} debe ser un entero`)
    .positive(`El ${label} debe ser mayor a 0`)
    .describe(name);

const asignacionRolSchema = z.object({
  id_rol: fk("id_rol", "id_rol"),
  id_usuario: fk("id_usuario", "id_usuario"),
});

export const createAsignacionRolSchema = asignacionRolSchema;
export const updateAsignacionRolSchema = asignacionRolSchema.partial();
