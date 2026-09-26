# CRUD Usuarios con alta condicional por rol

> Fecha: 2026-09-19. Decisiones del usuario: toggle **múltiple** (asesor + estudiante + administrativo + apoderado combinables), asignación de roles **también en edición**, tabla con **columna Rol** (4 GETs extra al cargar).

## 1. Base verificada

### Backend (`C:\CODIGO\GrupoAlfa`)
- `usuarios` (`database/Script.sql:43-53`): PK `id_usuario` (identity), `nro_carnet` UNIQUE NOT NULL, `apellido_paterno` NOT NULL, `apellido_materno` nullable, `nombre`, `fecha_nacimiento` DATE nullable, `correo_electronico` UNIQUE, `contraseña`, `usuario_vigente`.
- `POST /api/usuarios` **pública** → `201 { estado, datos (incluye `id_usuario`), token }`; `409` carnet/correo duplicado (`src/controllers/usuarios.controllers.js:51-92`). `GET /:id`, `PUT /:id`, `DELETE /:id` con `authMiddleware`; el GET lista sin `contraseña`.
- Roles con CRUD + auth montados en `/api` (`src/index.js:34-41`):
  - `asesores` / `administrativos`: solo `id_usuario` (validators homónimos).
  - `apoderados`: `id_usuario` + `celular` ≤ 20; el DELETE se bloquea con `409` si tiene estudiantes (`apoderados.controllers.js:65-79`).
  - `estudiantes`: `id_usuario` UNIQUE + `id_apoderado?` + `colegio_de_procedencia` ≤ 150 + `direccion_de_domicilio` ≤ 255, sin `foto`; `409` si el usuario ya es estudiante o no existe.
- Borrado de usuario: CASCADE en administrativos/apoderados/estudiantes, SET NULL en asesores (DDL).

### Frontend (`GrupoAlfaFrontend`)
- `src/config/entities.js` + `ENTITY_ORDER` alimentan Sidebar, `DashboardHome` (contadores) y `pages/app/EntityPage.jsx → CrudPage` genérico (`components/dashboard/CrudPage.jsx` + `EntityFormModal.jsx` + `hooks/useCrud.js` + `services/academicService.js`).
- El formulario genérico no sirve para el toggle condicional: se requiere un `UsuarioFormModal` dedicado.

## 2. Cambios

1. **`src/config/entities.js`**: entrada `usuarios` (`path: /app/usuarios`, `endpoint: usuarios`, `pk: id_usuario`; columnas: carnet, nombre completo, correo, vigente, **rol**; `fields` = campos usuario espejo de `usuariosValidators`: carnet, paterno, materno, nombre, fecha, correo, contraseña min 8, vigente). Añadir `usuarios` primero en `ENTITY_ORDER` → sidebar, ruta `/app/usuarios` y contador del dashboard automáticos.
2. **`src/services/rolesService.js`** (nuevo): `fetchRoleMap()` — 4 `GET` (`asesores`, `administrativos`, `estudiantes`, `apoderados`) en paralelo → `{ asesores: Set, administrativos: Set, estudiantes: Map, apoderados: Map }` por `id_usuario`; `syncRoles(id_usuario, { roles, fields })` — diff crear/eliminar por rol (`POST` con sus campos / `DELETE` de la fila rol; resuelve `id_*` de rol vía el map o `GET` por `id_usuario`).
3. **`src/components/features/usuarios/UsuarioFormModal.jsx`** (nuevo): sección usuario + **toggle múltiple** (4 switches: Asesor, Estudiante, Administrativo, Apoderado); al activar cada uno se despliegan sus campos (estudiante: `id_apoderado?`, colegio, dirección; apoderado: `celular?`; asesor/administrativo: sin campos). En edición precarga roles desde el `roleMap` (+ campos de la fila rol cuando aplique).
4. **`src/pages/app/EntityPage.jsx`**: si `entityKey === "usuarios"` renderiza `UsuariosPage` (nueva: `useCrud(usuarios)` + `roleMap` para columna Rol y precarga del modal).
   - **Crear con roles**: `POST /usuarios` → con `id_usuario` devuelto, `POST` a cada rol activo. Sin rollback destructivo: si un rol falla (409), se conserva el usuario, se muestra qué rol falló y se ofrece reintento desde edición.
   - **Editar**: `PUT /usuarios/:id` + `syncRoles` (crea filas nuevas, elimina roles desactivados con confirmación explícita por ser definitivo).
   - **Eliminar**: `DELETE` genérico (CASCADE / SET NULL del DDL).
5. **Validación espejo**: contraseña min 8 obligatoria solo en creación (en edición, vacía = no cambia); `409` de carnet/correo con mensaje del backend.

## 3. Verificación

- `npm run lint` limpio + `npm run build` (chunk `UsuariosPage`/`UsuarioFormModal` separado).
- Smoke: crear usuario solo; crear con 2 roles (ver filas en tablas rol); carnet duplicado → 409; editar asignando y quitando rol; eliminar usuario con CASCADE; columna Rol correcta tras recarga; apoderado con estudiantes → 409 anticipado en mensaje.

## 4. Riesgos

- `estudiantes.id_usuario` UNIQUE → 409 controlado si ya es estudiante.
- Quitar rol apoderado con estudiantes asociados → 409 del backend (advertir en la confirmación).
- `foto` de estudiantes fuera de alcance (decisión del plan de endpoints).
- Columna Rol: 4 GETs adicionales por carga de la pantalla (aceptado); si degradan, la tabla sigue funcional sin la columna.
