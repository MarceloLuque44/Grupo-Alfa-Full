import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "convocatorias_preuniversitario",
  pk: "id_convocatoria",
  label: "Convocatoria no encontrada",
  writable: ["id_facultad", "fecha_inicio"],
  filters: ["id_facultad"],
  fks: [
    { column: "id_facultad", table: "facultades", pk: "id_facultad", message: "La facultad no existe" },
  ],
  deleteGuards: [
    {
      table: "cursos_capacitacion",
      fk: "id_convocatoria",
      message: "No se puede eliminar: la convocatoria tiene cursos de capacitación asociados",
    },
  ],
});

export const getConvocatorias = crud.list;
export const getConvocatoriaById = crud.getById;
export const createConvocatoria = crud.create;
export const updateConvocatoria = crud.update;
export const deleteConvocatoria = crud.remove;
