import { createCrud } from "../utils/crudFactory.js";

const crud = createCrud({
  table: "examenes_de_ingreso",
  pk: "id_examen_de_ingreso",
  label: "Examen no encontrado",
  writable: ["id_convocatoria", "id_materia"],
  filters: ["id_convocatoria", "id_materia"],
  fks: [
    {
      column: "id_convocatoria",
      table: "convocatorias_preuniversitario",
      pk: "id_convocatoria",
      message: "La convocatoria no existe",
    },
    { column: "id_materia", table: "materias", pk: "id_materia", message: "La materia no existe" },
  ],
});

export const getExamenes = crud.list;
export const getExamenById = crud.getById;
export const createExamen = crud.create;
export const updateExamen = crud.update;
export const deleteExamen = crud.remove;
