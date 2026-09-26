# Plan: Endpoints materias, asesores, capacitaciones, temas y estudiantes

## 1. Decisiones cerradas
1. **Alcance: 5 módulos.** `preparacion` fue error de transcripción; la tabla real es `cursos_capacitacion` (= capacitaciones). No existe tabla `preparacion` en `database/Script.sql`.
2. **Capacitaciones = `cursos_capacitacion`.** Nombre de archivos/rutas en español (`capacitaciones.*`, `/api/capacitaciones`), tabla SQL `cursos_capacitacion`.
3. **Temas tiene `nombre_tema`.** `Script.sql:123-132` solo trae `id_tema, id_materia`; se asume columna agregada `nombre_tema VARCHAR(150)`. Verificar con `\d temas` en build.
4. **Estudiantes sin `foto`.** Columna `foto BYTEA` se omite del API por ahora (no se selecciona ni se inserta).
5. **Protección:** todos los endpoints con `authMiddleware` (Bearer o cookie `jwt`), como `src/routes/usuarios.routes.js:27-30`.
6. **Patrón a replicar:** `usuarios.controllers.js` + `usuarios.routes.js` + `usuariosValidators.js` + `validateRequest` + `next(error)` → `errorMiddleware`.

## 2. Stack y base detectados
`Express 5 + pg 8 + zod 4 + jsonwebtoken 9 + bcrypt 6` (`package.json`). Pool en `src/db.js:10`. Montaje actual `src/index.js:27` solo `usuariosRoutes`. Tablas en `database/Script.sql`:
- `materias(id_materia IDENTITY PK, nombre_materia VARCHAR(150) NOT NULL)` (:115-118).
- `asesores(id_asesor PK, id_usuario FK→usuarios.nro_carnet ON DELETE RESTRICT)` (:99-108).
- `temas(id_tema PK, id_materia FK→materias ON DELETE SET NULL)` (:123-132) + `nombre_tema` agregado por el usuario.
- `cursos_capacitacion(id_capacitacion PK, id_convocatoria FK NOT NULL RESTRICT, id_aula FK NOT NULL RESTRICT, nivel, nombre NOT NULL, modalidad, fecha_inicio, hora_inicio, hora_fin)` (:382-406).
- `estudiantes(id_estudiante PK, id_usuario FK CASCADE, id_apoderado FK SET NULL, colegio_de_procedencia, direccion_de_domicilio, foto)` (:156-174).

## 3. Deuda / bugs previos a corregir
- `src/controllers/asesores_controllers.js:19`: `INSERT ... VALUES ('${id_usuario}')` interpolado (SQL injection). `updateUser:28-37` sin `WHERE` y params incorrectos. `deleteUser:42` usa `id_asesor` no definido (debería ser `id`).
- `src/routes/asesores.routes.js:1-18`: importa `usuarios.controllers.js` y expone `/usuarios`; debe reescribirse a CRUD `/asesores`. Archivo controlador se renombra a `asesores.controllers.js` (plural, convención usuarios).

## 4. Contrato REST (los 5 módulos)
```
GET    /api/<recurso>        auth, 200 [rows]
GET    /api/<recurso>/:id    auth, 200 row | 400 id no numérico | 404 no encontrado
POST   /api/<recurso>        auth + validateRequest(createSchema), 201 row | 400 zod | 409 FK/duplicado
PUT    /api/<recurso>/:id    auth + validateRequest(updateSchema), 200 row | 400/404/409
DELETE /api/<recurso>/:id    auth, 204 sin body | 400/404/409 (RESTRICT)
```
- `<recurso>`: `materias, asesores, capacitaciones, temas, estudiantes`.
- Extras: `GET /api/temas?id_materia=X` filtro opcional; `GET /api/asesores` con JOIN a `usuarios` (nombre, apellidos, correo); `GET /api/temas` con JOIN a `materias(nombre_materia)`; listados de `estudiantes` excluyen `foto`.

## 5. Validadores zod
- **materias** `create: { nombre_materia: z.string().trim().min(1).max(150) }`.
- **asesores** `create: { id_usuario: z.coerce.number().int().positive() }` + chequeo `SELECT 1 FROM usuarios WHERE nro_carnet=$1` → 409 si no existe.
- **capacitaciones** `create: { id_convocatoria: coerce.int.positive (req), id_aula: coerce.int.positive (req), nombre: string trim min1 max150 (req), nivel: string max100 opc, modalidad: string max50 opc, fecha_inicio: string fecha válida opc, hora_inicio/hora_fin: string HH:MM opc + refine hora_fin>hora_inicio }` + verificación FK contra `convocatorias_preuniversitario` y `aulas`.
- **temas** `create: { nombre_tema: string trim min1 max150 (req), id_materia: coerce.int.positive opcional/nulleable }` + verificación FK contra `materias`.
- **estudiantes** `create: { id_usuario: coerce.int.positive (req, existe en usuarios), id_apoderado: coerce.int.positive opc (existe en apoderados), colegio_de_procedencia: string max150 opc, direccion_de_domicilio: string max255 opc }`.
- `updateSchema = createSchema.partial()` en los 5.

## 6. Controladores (reglas comunes)
- Queries siempre parametrizadas `$1,$2`; updates dinámicos con `COALESCE` (patrón `updateUsuario:177-189`).
- Verificación previa de FK para error 409 claro antes de `INSERT/UPDATE`.
- `try/catch → next(error)` para que `errorMiddleware` mapee `23505→409, 23503→409, 22P02→400`.
- `DELETE` respeta `RESTRICT` (asesores, capacitaciones) vs `CASCADE/SET NULL` según DDL.
- `estudiantes`: `SELECT` lista columnas sin `foto`; `INSERT/UPDATE` sin `foto`.

## 7. Archivos
Crear 15:
```
src/controllers/materias.controllers.js, asesores.controllers.js,
  capacitaciones.controllers.js, temas.controllers.js, estudiantes.controllers.js
src/validators/materiasValidators.js, asesoresValidators.js,
  capacitacionesValidators.js, temasValidators.js, estudiantesValidators.js
src/routes/materias.routes.js, asesores.routes.js,
  capacitaciones.routes.js, temas.routes.js, estudiantes.routes.js
```
Borrar/renombrar: `src/controllers/asesores_controllers.js` → `asesores.controllers.js`.
Modificar: `src/index.js` (importar y `app.use("/api", <cada>Router)`).

Ejemplo ruta (`capacitaciones.routes.js`):
```js
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createCapacitacionSchema, updateCapacitacionSchema } from "../validators/capacitacionesValidators.js";
import { getCapacitaciones, getCapacitacionById, createCapacitacion, updateCapacitacion, deleteCapacitacion } from "../controllers/capacitaciones.controllers.js";
const router = Router();
router.get("/capacitaciones", authMiddleware, getCapacitaciones);
router.get("/capacitaciones/:id", authMiddleware, getCapacitacionById);
router.post("/capacitaciones", authMiddleware, validateRequest(createCapacitacionSchema), createCapacitacion);
router.put("/capacitaciones/:id", authMiddleware, validateRequest(updateCapacitacionSchema), updateCapacitacion);
router.delete("/capacitaciones/:id", authMiddleware, deleteCapacitacion);
export default router;
```

## 8. Orden de build y verificación
1. `materias` + fix `asesores`.
2. `temas` (depende materias) + `capacitaciones` + `estudiantes`.
3. Registro en `src/index.js` + `node --check src/*.js src/**/*.js`.
4. Smoke con JWT: `GET /health`, `POST /api/materias`, `POST /api/asesores`, `POST /api/capacitaciones`, `POST /api/temas`, `POST /api/estudiantes`, luego GET/PUT/DELETE de cada uno; casos 400/404/409.

## 9. Riesgos
- Nombre exacto de `temas.nombre_tema` puede diferir (ej. `nombre`, `titulo`); confirmar `\d temas` antes de codificar.
- `id_convocatoria/id_aula` NOT NULL con `RESTRICT`: crear capacitaciones exige datos semilla válidos.
- `estudiantes.id_usuario` UNIQUE implícito por uso; si un usuario ya es estudiante, `INSERT` puede violar unicidad → 409.
