# Bitácora del proceso: pantalla "Llamar lista" + endpoints faltantes

Documento que registra, en orden cronológico, todo el trabajo realizado en la sesión:
1) nueva pantalla de pase de lista en el dashboard (skill `react-vite-best-practices`) y
2) creación de los endpoints de las tablas faltantes (skill `rest-api-design`).

---

## 1. Pantalla extra "Llamar lista" en el dashboard

### 1.1. Exploración previa

Se inspeccionó el workspace antes de codificar:

- `frontend/src/routes/router.jsx` — rutas con `React.lazy()` + `RequireAuth` + `DashboardLayout`; las entidades CRUD se resuelven con la ruta genérica `:entityKey`.
- `frontend/src/layouts/DashboardLayout.jsx` — título derivado del segmento de URL.
- `frontend/src/components/dashboard/Sidebar.jsx` — navegación lateral con prefetch en `onMouseEnter/onFocus`.
- `frontend/src/config/entities.js` — `ENTITIES` + `ENTITY_ORDER` (usuarios, materias, asesores, capacitaciones, temas, estudiantes).
- `frontend/src/services/academicService.js` / `apiClient.js` — cliente axios con `VITE_API_URL` e interceptor de JWT.
- `frontend/vite.config.js` — `manualChunks` por vendor (`vendor-react`, `vendor-router`, `vendor-http`) y `optimizeDeps`.
- `backend/database/Script.sql` — modelo real: `cursos_capacitacion`, `matriculaciones` (estudiante↔curso), `clases`, `asistencias`. El backend **no** exponía `matriculaciones` (se creó después, ver §2).

### 1.2. Reglas de la skill aplicadas

| Regla | Aplicación |
|---|---|
| `split-route-lazy` | `PaseListaPage` con `lazy()` en `router.jsx`, ruta `/app/pase-lista` antes de `:entityKey` |
| `split-dynamic-imports` | `PaseListaTable` se importa dinámicamente solo al elegir curso |
| `split-suspense-boundaries` | `Suspense` + `Skeleton` alrededor de la tabla |
| `split-prefetch-hints` | Prefetch en hover/focus del enlace lateral |
| `build-manual-chunks` | Sin cambios; el build confirma chunks separados |
| `env-vite-prefix` | Reutiliza `apiClient` (`VITE_API_URL`) |

### 1.3. Archivos creados

- **`frontend/src/services/paseListaService.js`**
  - `loadPaseListaCatalogs()` — carga en paralelo materias, asesores, capacitaciones, temas, estudiantes y usuarios.
  - `loadEstudiantesPorCurso(idCurso)` — intenta `GET /matriculaciones` con params `id_curso_capacitacion | id_curso | curso`; devuelve `null` si el backend no lo expone (fallback en la UI).
- **`frontend/src/pages/app/PaseListaPage.jsx`** — formulario (materia, asesor, horario, curso de capacitación, aula, fecha, tema avanzado con `datalist` de temas) + tabla de estudiantes del curso + guardado local en `localStorage (ga_pase_lista)`. Al elegir curso autocompleta aula/horario desde el curso.
- **`frontend/src/components/pase-lista/PaseListaTable.jsx`** — tabla con checkboxes presente/ausente, marcado masivo y resumen (presentes/ausentes/sin marcar).

### 1.4. Archivos modificados

- `frontend/src/routes/router.jsx` — ruta `pase-lista`.
- `frontend/src/components/dashboard/Sidebar.jsx` — enlace "Llamar lista" con prefetch.
- `frontend/src/layouts/DashboardLayout.jsx` — título "Llamar lista".
- `frontend/src/pages/app/DashboardPage.jsx` — tarjeta de acceso directo en el dashboard.
- `frontend/src/App.css` — estilo `select` igualado al de `input`.

### 1.5. Verificación

`npm run build` → `✓ built in 2.23s`, con chunks separados `PaseListaPage` y `PaseListaTable`.

### 1.6. Deuda conocida (resuelta en §2)

- Sin endpoint de `matriculaciones`, la lista usaba fallback (todos los estudiantes) con aviso. Tras crear el endpoint (§2), el frontend ya envía el param canónico `id_curso_capacitacion` y el alias `id_curso`.
- El guardado es local; cuando se conecte, usar `POST /api/asistencias` (ver §2.5).

---

## 2. Endpoints de las 19 tablas faltantes

### 2.1. Diagnóstico

Tablas con CRUD previo (8): usuarios, materias, asesores, capacitaciones, temas, estudiantes, administrativos, apoderados.
Tablas **sin** endpoints (19): facultades, aulas, roles, carreras, convocatorias_preuniversitario, asignacion_rol, inscripciones, examenes_de_ingreso, contenidos, materias_asesores, postulaciones, materias_convocatoria_asignacion, asignaciones_asesores, asignaciones_materias, matriculaciones, clases, avances, mensualidades, asistencias.

Se replicó el patrón del repo (`*.controllers.js` + `*.routes.js` + `*Validators.js` + `validateRequest` + `authMiddleware` + `next(error)` → `errorMiddleware`).

### 2.2. Decisión de diseño: factoría común

En vez de 19 controladores copiados a mano, se creó **`backend/src/utils/crudFactory.js`** (`createCrud({table, pk, label, writable, filters, filterAliases, fks, deleteGuards})`) que implementa el contrato uniforme:

```
GET    /api/<recurso>        200 [rows] + filtros ?col=valor
GET    /api/<recurso>/:id    200 | 400 | 404
POST   /api/<recurso>        201 | 400 (zod) | 409 (FK)
PUT    /api/<recurso>/:id    200 | 400 | 404 | 409
DELETE /api/<recurso>/:id    204 | 400 | 404 | 409 (guardas RESTRICT)
```

Propiedades: queries parametrizadas, verificación previa de FK con mensaje específico, `INSERT`/`UPDATE` dinámicos solo con claves provistas (respeta `DEFAULT` de la BD y usa `COALESCE`), orden de delete 400→404→409→204. Cada controlador sigue siendo un archivo propio (convención del repo) con su configuración.

### 2.3. Nombres REST (skill `rest-api-design`)

Sustantivos plurales, sin verbos, sin anidación (filtros por query en vez de sub-rutas):

| Endpoint | Tabla |
|---|---|
| `/facultades`, `/aulas`, `/roles` | idem |
| `/carreras`, `/convocatorias` | `carreras`, `convocatorias_preuniversitario` |
| `/asignaciones-rol`, `/inscripciones` | `asignacion_rol`, `inscripciones` |
| `/examenes` (sin `foto BYTEA`), `/contenidos` | `examenes_de_ingreso`, `contenidos` |
| `/materias-asesores`, `/postulaciones`, `/materias-convocatoria` | `materias_asesores`, `postulaciones`, `materias_convocatoria_asignacion` |
| `/asignaciones-asesores`, `/asignaciones-materias` | idem |
| `/matriculaciones`, `/clases`, `/avances`, `/mensualidades`, `/asistencias` | idem |

Filtros colección: `?id_facultad=`, `?id_rol=&id_usuario=`, `?id_estudiante=&id_administrativo=`, `?id_convocatoria=&id_materia=`, `?id_examen_de_ingreso=&id_tema=`, `?id_asesor=&id_materia=`, `?id_estudiante=&id_carrera=`, `?id_convocatoria=&id_materia=`, `?id_asesor=&id_curso_capacitacion=`, `?id_materia=&id_curso_capacitacion=`, `?id_estudiante=&id_curso_capacitacion=`, `?id_curso_capacitacion=&id_asesor=&id_tema=`, `?id_clase=&id_tema=`, `?id_estudiante=&id_administrativo=`, `?id_clase=&id_estudiante=`. Alias `?id_curso=` / `?curso=` aceptados para `id_curso_capacitacion`.

Guardas DELETE (409 específico): facultades←carreras/convocatorias, aulas←cursos, roles←asignacion_rol, carreras←postulaciones, convocatorias←cursos, clases←avances.

### 2.4. Archivos

- Creados (58): `src/utils/crudFactory.js` + 19 controladores + 19 validadores + 19 rutas.
- Modificado (1): `src/index.js` — 27 routers montados en `/api`.
- Plan: `backend/docs/plan-endpoints-faltantes.md` (§1–§9, misma estructura que `plan-endpoints-academicos.md` y `plan-endpoints-administrativos-apoderados.md`).

### 2.5. Verificación en vivo (BD real, servidor temporal, luego apagado y datos limpiados)

- `node --check` de los 58 archivos: OK. Carga de routers: **95 endpoints**.
- 19× `GET` colección → 200 con JWT.
- Cadena facultad→carrera: 201, filtro `?id_facultad=` OK, PUT 200, DELETE con hija → 409, DELETE en orden → 204.
- Bordes: body vacío → 400, FK inexistente → 409, `:id` no numérico → 400, inexistente → 404, `capacidad: 0` / `pago: -1` → 400, rol duplicado → 409, asistencia sin `hora_entrada` → 400.
- **Bug corregido**: el 404 duplicaba el mensaje (`Carrera no encontrada no encontrado`); la factoría ahora usa el label verbatim.

### 2.6. Conexión pendiente frontend ↔ nuevos endpoints

- `PaseListaPage` ya puede usar `GET /matriculaciones?id_curso_capacitacion=X` (sin fallback).
- Guardar asistencia real: `POST /api/clases` (curso + asesor + tema + `inicioClase`) y luego un `POST /api/asistencias` por estudiante (`id_clase`, `id_estudiante`, `hora_entrada` ISO 8601, `permiso`/`razon_permiso` opcionales).
- Deuda de módulos previos (anotada en el plan §6): `materias←examenes`, `asesores←clases`, `estudiantes←matriculaciones/mensualidades`, `capacitaciones←matriculaciones` usan el 409 genérico del `errorMiddleware`; migrar a guardas específicas.
