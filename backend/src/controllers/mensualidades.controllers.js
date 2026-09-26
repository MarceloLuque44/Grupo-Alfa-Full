import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "mensualidades",
  pk: "id_mensualidad",
  label: "Mensualidad no encontrada",
  writable: [
    "id_estudiante",
    "id_administrativo",
    "fecha_inicio_mensualidad",
    "fecha_fin_mensualidad",
    "pago",
  ],
  filters: ["id_estudiante", "id_administrativo"],
  fks: [
    { column: "id_estudiante", table: "estudiantes", pk: "id_estudiante", message: "El estudiante no existe" },
    {
      column: "id_administrativo",
      table: "administrativos",
      pk: "id_administrativo",
      message: "El administrativo no existe",
    },
  ],
});

export const getMensualidades = crud.list;
export const getMensualidadById = crud.getById;
export const createMensualidad = crud.create;
export const updateMensualidad = crud.update;
export const deleteMensualidad = crud.remove;
