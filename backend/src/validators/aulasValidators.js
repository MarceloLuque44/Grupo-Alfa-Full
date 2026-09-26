import { z } from "zod";

const aulaSchema = z.object({
  capacidad: z.coerce
    .number({ invalid_type_error: "La capacidad debe ser numérica" })
    .int("La capacidad debe ser un entero")
    .positive("La capacidad debe ser mayor a 0"),
});

export const createAulaSchema = aulaSchema;
export const updateAulaSchema = aulaSchema.partial();
