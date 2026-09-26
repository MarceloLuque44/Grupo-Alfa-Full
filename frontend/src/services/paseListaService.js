import { listResource } from "./academicService"

/**
 * Catálogos necesarios para el pase de lista.
 * Reutiliza los endpoints CRUD existentes (materias, asesores,
 * capacitaciones, temas, estudiantes, usuarios).
 */
export async function loadPaseListaCatalogs() {
  const [materias, asesores, capacitaciones, temas, estudiantes, usuarios] =
    await Promise.all([
      listResource("materias").catch(() => []),
      listResource("asesores").catch(() => []),
      listResource("capacitaciones").catch(() => []),
      listResource("temas").catch(() => []),
      listResource("estudiantes").catch(() => []),
      listResource("usuarios").catch(() => []),
    ])
  return { materias, asesores, capacitaciones, temas, estudiantes, usuarios }
}

/**
 * Estudiantes registrados en un curso de capacitación.
 * Intenta el endpoint de matriculaciones cuando exista
 * (`GET /matriculaciones?id_curso_capacitacion=...` o `/matriculaciones/curso/:id`);
 * si el backend aún no lo expone, devuelve `null` para que la UI
 * aplique el fallback (todos los estudiantes) con aviso.
 */
export async function loadEstudiantesPorCurso(idCurso) {
  if (!idCurso) return null
  const params = { id_curso_capacitacion: idCurso, id_curso: idCurso, curso: idCurso }
  try {
    const rows = await listResource("matriculaciones", params)
    if (Array.isArray(rows)) return rows
    return null
  } catch {
    return null
  }
}
