import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "matriculaciones",
  pk: "id_matriculacion",
  label: "Matriculación no encontrada",
  writable: ["id_estudiante", "id_curso_capacitacion", "esta_vigente", "nro_comprobante", "nro_credencial"],
  filters: ["id_estudiante", "id_curso_capacitacion"],
  filterAliases: { id_curso: "id_curso_capacitacion", curso: "id_curso_capacitacion" },
  fks: [
    { column: "id_estudiante", table: "estudiantes", pk: "id_estudiante", message: "El estudiante no existe" },
    {
      column: "id_curso_capacitacion",
      table: "cursos_capacitacion",
      pk: "id_capacitacion",
      message: "El curso de capacitación no existe",
    },
  ],
});

export const getMatriculaciones = crud.list;
export const getMatriculacionById = crud.getById;
export const createMatriculacion = crud.create;
export const updateMatriculacion = crud.update;
export const deleteMatriculacion = crud.remove;
