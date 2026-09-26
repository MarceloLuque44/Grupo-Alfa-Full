import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "facultades",
  pk: "id_facultad",
  label: "Facultad no encontrada",
  writable: ["nombre"],
  deleteGuards: [
    { table: "carreras", fk: "id_facultad", message: "No se puede eliminar: la facultad tiene carreras asociadas" },
    {
      table: "convocatorias_preuniversitario",
      fk: "id_facultad",
      message: "No se puede eliminar: la facultad tiene convocatorias asociadas",
    },
  ],
});

export const getFacultades = crud.list;
export const getFacultadById = crud.getById;
export const createFacultad = crud.create;
export const updateFacultad = crud.update;
export const deleteFacultad = crud.remove;
