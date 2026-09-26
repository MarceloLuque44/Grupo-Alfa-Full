import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "inscripciones",
  pk: "id_inscripcion",
  label: "Inscripción no encontrada",
  writable: [
    "id_administrativo",
    "id_estudiante",
    "como_se_entero_de_nosotros",
    "recalculo",
    "preparacion_previa",
    "tiempo_de_preparacion_meses",
    "lugar_de_preparacion",
  ],
  filters: ["id_administrativo", "id_estudiante"],
  fks: [
    {
      column: "id_administrativo",
      table: "administrativos",
      pk: "id_administrativo",
      message: "El administrativo no existe",
    },
    { column: "id_estudiante", table: "estudiantes", pk: "id_estudiante", message: "El estudiante no existe" },
  ],
});

export const getInscripciones = crud.list;
export const getInscripcionById = crud.getById;
export const createInscripcion = crud.create;
export const updateInscripcion = crud.update;
export const deleteInscripcion = crud.remove;
