import { z } from "zod";

const asesorSchema = z.object({
  id_usuario: z.coerce
    .number({ invalid_type_error: "El id_usuario debe ser numérico" })
    .int("El id_usuario debe ser un entero")
    .positive("El id_usuario debe ser mayor a 0"),
});

export const createAsesorSchema = asesorSchema;
export const updateAsesorSchema = asesorSchema.partial();
