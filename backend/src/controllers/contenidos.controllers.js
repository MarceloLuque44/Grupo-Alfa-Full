import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "contenidos",
  pk: "id_contenido",
  label: "Contenido no encontrado",
  writable: ["id_examen_de_ingreso", "id_tema"],
  filters: ["id_examen_de_ingreso", "id_tema"],
  fks: [
    {
      column: "id_examen_de_ingreso",
      table: "examenes_de_ingreso",
      pk: "id_examen_de_ingreso",
      message: "El examen de ingreso no existe",
    },
    { column: "id_tema", table: "temas", pk: "id_tema", message: "El tema no existe" },
  ],
});

export const getContenidos = crud.list;
export const getContenidoById = crud.getById;
export const createContenido = crud.create;
export const updateContenido = crud.update;
export const deleteContenido = crud.remove;
