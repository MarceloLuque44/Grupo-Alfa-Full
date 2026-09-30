# Plan: pestaña Asistencias desde BD con filtros y paginación

## 1. Objetivo

Migrar la pestaña **Asistencias** (pantalla Llamar lista) de `localStorage` a la base de datos,
con filtro de fechas paginado (`limit`/`offset`) y toggles de filtro por curso, materia y tema avanzado,
sin sobrecargar el API ni el cliente.

## 2. Decisiones cerradas

1. **10 registros por página.** Técnica `limit+1`: se piden 11 y el extra solo indica si hay página siguiente.
2. **Respuesta del API sin cambios de formato** (sigue siendo array) para no romper `useCrud` de las demás pantallas.
3. **Última lista local separada**: sección propia etiquetada **"En este dispositivo"**, visible solo si su `id_clase` no está en la página actual de BD.
4. **Filtros combinables con `AND`**: fechas + curso + materia + tema.
5. **Toggles estilo `toggle-group`** (patrón ya usado en la app): Fecha, Curso, Materia, Tema. Cada toggle activo despliega su control y resalta su chip; al desactivarlo se limpia ese criterio.

## 3. Análisis de soporte por filtro

| Filtro | Estado backend | Acción |
|---|---|---|
| Curso | ✅ `?id_curso_capacitacion=` existe | Solo UI (select de capacitaciones) |
| Tema avanzado | ✅ `?id_tema=` existe (el guardado resuelve el texto a `id_tema`) | Solo UI (select de temas) |
| Fechas | ❌ | Nuevo rango `?desde=&hasta=` sobre `clases.inicioClase` |
| Materia | ❌ (`clases` no tiene columna de materia) | Nuevo `?id_materia=` vía `EXISTS` en `asignaciones_materias` |
| Paginación | ❌ (los listados devuelven todo) | Nuevo `?limit=` (default 25, tope 100) + `?offset=` (default 0) genéricos en la factoría |

## 4. Cambios backend

| Archivo | Cambio |
|---|---|
| `src/utils/crudFactory.js` | Aceptar `limit`/`offset` en todos los `list` (ignorar el resto de query keys como hoy). Soporte opcional `dateRange: { column, desdeParam, hastaParam }` y/o `customWhere` para filtros con JOIN/subquery. Fechas inválidas → 400. |
| `src/controllers/clases.controllers.js` | Configurar `dateRange` sobre `inicioClase` y filtro `id_materia` con `WHERE EXISTS (SELECT 1 FROM asignaciones_materias WHERE id_curso_capacitacion = clases.id_curso_capacitacion AND id_materia = $n)`. |

## 5. Cambios frontend

| Archivo | Cambio |
|---|---|
| `src/components/pase-lista/AsistenciasTab.jsx` (principal) | Barra de toggles (Fecha/Curso/Materia/Tema) con sus controles; estado `{ desde, hasta, idCurso, idMateria, idTema, offset }`; carga `GET /clases?...&limit=11&offset=` y por cada clase `GET /asistencias?id_clase=` en paralelo para conteos; botones Anterior/Siguiente; sección "En este dispositivo"; modal de detalle reutilizado; eliminar con `DELETE /api/clases/:id` y manejo del 409 (avances asociados). |
| `src/services/paseListaService.js` (opcional) | Helper `fetchClasesConAsistencias(filtros)` para no engordar el componente. |

## 6. Casos borde

- `offset` más allá del total → lista vacía con mensaje y botón de volver.
- `desde > hasta` → 400 del backend, mostrar mensaje.
- `limit > 100` → topeado a 100 por el backend.
- Clase sin asistencias → conteos en 0, el detalle muestra tabla vacía.
- `localStorage` con formato array viejo → `readListas()` ya lo normaliza (§ formato de `pase-lista-db.md`).
- Eliminar clase con avances → 409 con mensaje específico, la fila se conserva.

## 7. Verificación

1. `node --check` de los archivos backend tocados.
2. Smoke con servidor temporal: sembrar ~30 clases, comprobar `limit/offset`, `desde/hasta`, `id_materia`, `id_curso_capacitacion`, `id_tema` combinados, 400 ante fechas inválidas y limpieza posterior.
3. `npm run build` en `frontend`.
4. Prueba manual: toggles, filtros combinados, paginación y sección "En este dispositivo".

## 8. Fuera de alcance

- Envelope `{data, total}` (se descartó por romper `useCrud`).
- Búsqueda por texto libre en Asistencias.
- Migración/eliminación del formato array viejo de `localStorage`.
