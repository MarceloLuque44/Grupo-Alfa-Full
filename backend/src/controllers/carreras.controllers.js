import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "carreras",
  pk: "id_carrera",
  label: "Carrera no encontrada",
  writable: ["id_facultad", "nombre"],
  filters: ["id_facultad"],
  fks: [
    { column: "id_facultad", table: "facultades", pk: "id_facultad", message: "La facultad no existe" },
  ],
  deleteGuards: [
    { table: "postulaciones", fk: "id_carrera", message: "No se puede eliminar: la carrera tiene postulaciones asociadas" },
  ],
});

export const getCarreras = crud.list;
export const getCarreraById = crud.getById;
export const createCarrera = crud.create;
export const updateCarrera = crud.update;
export const deleteCarrera = crud.remove;
