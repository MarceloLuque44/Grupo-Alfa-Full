# Plan: Endpoints de las 19 tablas faltantes

## 1. Decisiones cerradas

1. **Alcance: 19 recursos nuevos.** Cubren todas las tablas de `database/Script.sql` sin CRUD: `facultades, aulas, roles, carreras, convocatorias_preuniversitario, asignacion_rol, inscripciones, examenes_de_ingreso, contenidos, materias_asesores, postulaciones, materias_convocatoria_asignacion, asignaciones_asesores, asignaciones_materias, matriculaciones, clases, avances, mensualidades, asistencias`. Ya existían: `usuarios, materias, asesores, capacitaciones (=cursos_capacitacion), temas, estudiantes, administrativos, apoderados` (ver `plan-endpoints-academicos.md` y `plan-endpoints-administrativos-apoderados.md`).
2. **Nombres REST en español, sustantivos plurales, sin verbos** (skill `rest-api-design`): tablas con nombre largo se acortan al sustantivo (`convocatorias_preuniversitario→/convocatorias`, `examenes_de_ingreso→/examenes`, `cursos_capacitacion→/capacitaciones` ya existente); tablas puente con guion (`/materias-asesores`, `/materias-convocatoria`, `/asignaciones-asesores`, `/asignaciones-materias`, `/asignaciones-rol`). Sin anidación (máx. 2 niveles: filtros por query en vez de sub-rutas).
3. **Factoría común `src/utils/crudFactory.js`.** Los 19 recursos comparten contrato; en vez de 19 controladores copiados a mano, cada `*.controllers.js` es una configuración delgada (`table, pk, label, writable, filters, filterAliases, fks, deleteGuards`) sobre `createCrud()`. Mismo comportamiento que el patrón `usuarios/materias`: queries parametrizadas, `next(error)` → `errorMiddleware` (`23505/23503→409`, `22P02→400`).
4. **`foto BYTEA` excluida** en `examenes` (mismo criterio que `estudiantes`: no se selecciona ni se inserta).
5. **Protección:** los 95 endpoints nuevos llevan `authMiddleware` (Bearer o cookie `jwt`), como el resto del API.
6. **Fechas ISO 8601** (`fecha_inicio`, `inicioClase`, `hora_entrada`, `salida_antes_de_tiempo`); horas `HH:MM` donde aplica.

## 2. Contrato REST (los 19 módulos)

```
GET    /api/<recurso>        auth, 200 [rows] + filtros ?col=valor
GET    /api/<recurso>/:id    auth, 200 row | 400 id no numérico | 404 no encontrado
POST   /api/<recurso>        auth + validateRequest(createSchema), 201 row | 400 zod | 409 FK inexistente
PUT    /api/<recurso>/:id    auth + validateRequest(updateSchema), 200 row | 400/404/409
DELETE /api/<recurso>/:id    auth, 204 sin body | 400/404/409 (guardas §6)
```

Filtros colección (query params, §5): `carreras?id_facultad=`, `convocatorias?id_facultad=`, `asignaciones-rol?id_rol=&id_usuario=`, `inscripciones?id_estudiante=&id_administrativo=`, `examenes?id_convocatoria=&id_materia=`, `contenidos?id_examen_de_ingreso=&id_tema=`, `materias-asesores?id_asesor=&id_materia=`, `postulaciones?id_estudiante=&id_carrera=`, `materias-convocatoria?id_convocatoria=&id_materia=`, `asignaciones-asesores?id_asesor=&id_curso_capacitacion=`, `asignaciones-materias?id_materia=&id_curso_capacitacion=`, `matriculaciones?id_estudiante=&id_curso_capacitacion=`, `clases?id_curso_capacitacion=&id_asesor=&id_tema=`, `avances?id_clase=&id_tema=`, `mensualidades?id_estudiante=&id_administrativo=`, `asistencias?id_clase=&id_estudiante=`. Alias cortos `?id_curso=` / `?curso=` aceptados para `id_curso_capacitacion` (compatibilidad con pantalla pase de lista del frontend).

## 3. Validadores zod (19 archivos en `src/validators/`)

- FK requerida: `z.coerce.number().int().positive()`; FK opcional (columnas nulleables: `inscripciones.*`, `examenes.*`, `contenidos.*`, `avances.*`, `clases.id_tema`): mismo + `.optional()`.
- `aulas.capacidad`: int positivo (`CHECK (capacidad > 0)`); `roles.nombre` max 50 UNIQUE; `mensualidades.pago` numérico `≥ 0`; `asistencias.razon_permiso` max 150; `inscripciones.tiempo_de_preparacion_meses` int `≥ 0`; booleanos (`recalculo`, `preparacion_previa`, `esta_vigente`, `permiso`) `z.boolean().optional()`; fechas/timestamps con refine de fecha válida.
- `updateSchema = createSchema.partial()` en los 19.

## 4. Controladores (reglas de la factoría)

- `INSERT`/`UPDATE` dinámicos solo con claves provistas: respeta `DEFAULT` de la BD en create (`recalculo`, `preparacion_previa`, `tiempo_de_preparacion_meses`, `esta_vigente`) y usa `COALESCE` en update.
- Verificación previa de FK (`SELECT 1 FROM <padre> WHERE <pk>=$1`) → `409 { error }` con mensaje específico antes de `INSERT/UPDATE`.
- `update` con body vacío: devuelve la fila actual (200) o 404; nunca rompe el `UPDATE`.
- `delete`: 1) `:id` numérico → 400; 2) existencia → 404; 3) guardas hijas → 409; 4) `DELETE` → 204.

## 5. Filtros

La factoría acepta solo columnas declaradas en `filters` (+ `filterAliases`); query keys desconocidas se ignoran. Valores inválidos (ej. `?id_clase=abc`) caen en `22P02→400` vía `errorMiddleware`.

## 6. Guardas en DELETE (relaciones RESTRICT, 409 específico)

- `facultades` ← `carreras`, `convocatorias_preuniversitario`.
- `aulas` ← `cursos_capacitacion`.
- `roles` ← `asignacion_rol`.
- `carreras` ← `postulaciones`.
- `convocatorias` ← `cursos_capacitacion`.
- `clases` ← `avances` (SET NULL en `avances.id_clase`, pero la guarda evita huérfanos silenciosos).
- Relaciones `CASCADE/SET NULL` sin guarda (borrado directo, igual que `temas`/`estudiantes` actuales).
- Deuda conocida (módulos previos, sin tocar): `materias` ← `examenes` (RESTRICT), `asesores` ← `clases` (RESTRICT), `estudiantes` ← `matriculaciones/mensualidades` (RESTRICT), `capacitaciones` ← `matriculaciones` (RESTRICT) dependen del `23503→409` genérico del `errorMiddleware`; conviene migrarlos a guardas específicas como estas.

## 7. Archivos

Crear 58:

```
src/utils/crudFactory.js
src/controllers/facultades|aulas|roles|carreras|convocatorias|asignacionesRol|
  inscripciones|examenes|contenidos|materiasAsesores|postulaciones|
  materiasConvocatoria|asignacionesAsesores|asignacionesMaterias|
  matriculaciones|clases|avances|mensualidades|asistencias .controllers.js (19)
src/validators/facultades|aulas|roles|carreras|convocatorias|asignacionesRol|
  inscripciones|examenes|contenidos|materiasAsesores|postulaciones|
  materiasConvocatoria|asignacionesAsesores|asignacionesMaterias|
  matriculaciones|clases|avances|mensualidades|asistencias Validators.js (19)
src/routes/...routes.js (19, 5 rutas c/u = 95 endpoints)
```

Modificar 1: `src/index.js` (importar y `app.use("/api", <cada>Router)` — 27 routers en total).

## 8. Orden de build y verificación

1. `crudFactory.js` + lote base (`facultades, aulas, roles`).
2. Lote nivel 2 (`carreras, convocatorias, asignaciones-rol, inscripciones`).
3. Lote puentes/exámenes (`examenes, contenidos, materias-asesores, postulaciones, materias-convocatoria`).
4. Lote académico-operativo (`asignaciones-asesores, asignaciones-materias, matriculaciones, clases, avances, mensualidades, asistencias`).
5. Registro en `src/index.js` + `node --check` de los 58 archivos + import de routers.
6. Smoke con JWT (requiere BD con `Script.sql` aplicado): `POST /api/facultades` → `POST /api/carreras` y `/api/convocatorias` con su `id_facultad` → `POST /api/capacitaciones` necesita `id_convocatoria + id_aula` válidos → `POST /api/matriculaciones`, `/api/clases`, `/api/asistencias` encadenando ids; filtros `GET /api/matriculaciones?id_curso_capacitacion=X`, `GET /api/asistencias?id_clase=Y`.
7. Casos borde: `:id` no numérico → 400; inexistente → 404; FK inexistente → 409; `DELETE` facultad con carreras → 409; `DELETE` convocatoria con cursos → 409; `capacidad: 0` / `pago: -1` → 400; rol duplicado → 409.

## 9. Riesgos

- `clases.inicioClase` es camelCase en DDL: se conserva el nombre exacto de columna (no renombrar a snake_case).
- `asignacion_rol.id_usuario` es `NOT NULL` con `ON DELETE SET NULL` (contradictorio en DDL): borrar un usuario con rol asignado fallará en BD → 409 genérico; requiere corrección DDL fuera del API.
- `roles.nombre` UNIQUE: duplicado → `23505→409 "Registro duplicado"`.
- Sin paginación en v1 (igual que módulos existentes); colecciones grandes (`asistencias`) la necesitarán a futuro.
