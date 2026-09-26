import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "avances",
  pk: "id_avance",
  label: "Avance no encontrado",
  writable: ["id_clase", "id_tema"],
  filters: ["id_clase", "id_tema"],
  fks: [
    { column: "id_clase", table: "clases", pk: "id_clase", message: "La clase no existe" },
    { column: "id_tema", table: "temas", pk: "id_tema", message: "El tema no existe" },
  ],
});

export const getAvances = crud.list;
export const getAvanceById = crud.getById;
export const createAvance = crud.create;
export const updateAvance = crud.update;
export const deleteAvance = crud.remove;
