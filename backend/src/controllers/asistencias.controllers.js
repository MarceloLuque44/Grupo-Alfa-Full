import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "asistencias",
  pk: "id_asistencia",
  label: "Asistencia no encontrada",
  writable: [
    "id_clase",
    "id_estudiante",
    "hora_entrada",
    "salida_antes_de_tiempo",
    "permiso",
    "razon_permiso",
  ],
  filters: ["id_clase", "id_estudiante"],
  fks: [
    { column: "id_clase", table: "clases", pk: "id_clase", message: "La clase no existe" },
    { column: "id_estudiante", table: "estudiantes", pk: "id_estudiante", message: "El estudiante no existe" },
  ],
});

export const getAsistencias = crud.list;
export const getAsistenciaById = crud.getById;
export const createAsistencia = crud.create;
export const updateAsistencia = crud.update;
export const deleteAsistencia = crud.remove;
