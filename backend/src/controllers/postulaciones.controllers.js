import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "postulaciones",
  pk: "id_postulacion",
  label: "Postulación no encontrada",
  writable: ["id_estudiante", "id_carrera"],
  filters: ["id_estudiante", "id_carrera"],
  fks: [
    { column: "id_estudiante", table: "estudiantes", pk: "id_estudiante", message: "El estudiante no existe" },
    { column: "id_carrera", table: "carreras", pk: "id_carrera", message: "La carrera no existe" },
  ],
});

export const getPostulaciones = crud.list;
export const getPostulacionById = crud.getById;
export const createPostulacion = crud.create;
export const updatePostulacion = crud.update;
export const deletePostulacion = crud.remove;
