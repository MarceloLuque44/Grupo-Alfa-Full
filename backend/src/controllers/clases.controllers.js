import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "clases",
  pk: "id_clase",
  label: "Clase no encontrada",
  writable: ["id_curso_capacitacion", "id_asesor", "id_tema", "inicioClase"],
  filters: ["id_curso_capacitacion", "id_asesor", "id_tema"],
  filterAliases: { id_curso: "id_curso_capacitacion", curso: "id_curso_capacitacion" },
  fks: [
    {
      column: "id_curso_capacitacion",
      table: "cursos_capacitacion",
      pk: "id_capacitacion",
      message: "El curso de capacitación no existe",
    },
    { column: "id_asesor", table: "asesores", pk: "id_asesor", message: "El asesor no existe" },
    { column: "id_tema", table: "temas", pk: "id_tema", message: "El tema no existe" },
  ],
  deleteGuards: [
    { table: "avances", fk: "id_clase", message: "No se puede eliminar: la clase tiene avances asociados" },
  ],
});

export const getClases = crud.list;
export const getClaseById = crud.getById;
export const createClase = crud.create;
export const updateClase = crud.update;
export const deleteClase = crud.remove;
