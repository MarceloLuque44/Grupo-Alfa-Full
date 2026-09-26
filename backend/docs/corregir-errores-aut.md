# Plan: Corregir autenticación y CRUD de usuarios

## Decisiones cerradas
1. **DB: pg only** - mantener `src/db.js` (`pg.Pool`), eliminar `src/config/db.js` y Prisma.
2. **Protección:** `GET /usuarios` y `GET /usuarios/:id` protegidos con `authMiddleware`.
3. **Prefijo:** todas las rutas bajo `/api` (`app.use("/api", usuariosRoutes)`).

## Stack detectado
`Express 5 + pg 8 + bcrypt 6 + jsonwebtoken 9 + zod 4 + cors + morgan`. Sin `cookie-parser`, sin `prisma` declarado pero `src/config/db.js:1` y `src/middleware/authMiddleware.js:2` lo importan.

Tabla real `usuarios(nro_carnet INT PK, apellido_paterno, apellido_materno, nombre, fecha_nacimiento DATE, correo_electronico UNIQUE, contraseña VARCHAR(255), Usuario_vigente BOOLEAN)` en `database/Script.sql:42`.

---

## Diagnóstico

### 1. Infraestructura rota
- **Dualidad DB:** `src/db.js:10` (pg, usado) vs `src/config/db.js:1` (Prisma, huérfano). `authMiddleware.js:2` usa `prisma.user.findUnique({where:{id}})` que no existe en schema real (`usuarios` por `nro_carnet`).
- **Cookie sin parser:** `src/utils/generateToken.js:9` y `src/controllers/usuarios.controllers.js:97` usan `res.cookie`/`req.cookies` pero `src/index.js:1` nunca monta `cookie-parser` -> `req.cookies` siempre `undefined`.
- **Config incompleta:** `src/config.js:1` no exporta `JWT_SECRET`/`JWT_EXPIRES_IN`, defaults `admin123/postgres` inconsistentes con `.env:1`. `DATABASE_URL` con espacio `Grupo Alfa` sin encode.
- **Express sin error handling:** `src/index.js:28` monta rutas sin prefijo y sin `notFound`/`errorHandler` de `src/middleware/errorMiddleware.js:7`.
- **Logger verboso:** `src/index.js:18-27` loguea `req.body` con contraseñas.

### 2. Rutas `src/routes/usuarios.routes.js:1`
- Sin `validateRequest` ni schemas (`src/validators/usuariosValidators.js:36` existe pero no se usa).
- CRUD sin `authMiddleware`.
- `POST /usuarios/login/` y `/logout/` con trailing slash inconsistente.
- `src/routes/asesores.routes.js:3` importa controlador equivocado (copiado de usuarios).

### 3. Controlador `src/controllers/usuarios.controllers.js:1`
| Método | Bug |
|---|---|
| `getUsuarios:4` | Sin `try/catch`, expone `contraseña` hasheada |
| `getUsuarioById:9` | Retorna `[]` 200 si no existe, expone hash, `parseInt` sin validar |
| `createUsuario:15` | `existe()` usa `OR` -> falso positivo; retorna `{datos:{rows}}` con hash; cookie sin parser |
| `login:71` | Sin `try/catch`, sin `return` tras `res.status` -> doble send; `esValido = compare && correo===row.correo` exige email aunque login sea por carnet; `SELECT ... OR` trae usuario equivocado; `201` en login; expone hash; ignora alias `password` |
| `updateUsuario:107` | Guarda `contraseña` en texto plano `SET contraseña=$6`, no hashea |
| `deleteUsuario:161` | `res.json(rows).sendStatus(204)` -> `ERR_HTTP_HEADERS_SENT`; `204` no debe tener body |
| `existe:174` | `WHERE nro_carnet=$1 OR correo_electronico=$2` con `null` rompe índice, `SELECT *` innecesario |

### 4. Auth `src/middleware/authMiddleware.js:6`
- Query a `prisma.user` inexistente. Debe ser `pool.query("SELECT ... FROM usuarios WHERE nro_carnet=$1")` y excluir `contraseña`.

### 5. Validadores `src/validators/usuariosValidators.js:1`
- `usuario_vigente: z.boolean()` falla si llega `"true"` string; debe ser `z.coerce.boolean()`.
- `loginUsuarioSchema:54` `refine` con `data.correo_electronico` truthy débil, permite `password` que controlador ignora.

---

## Plan de corrección (orden de ejecución)

### Fase 0 - Dependencias y config
1. `npm i cookie-parser` y eliminar `postinstall` prisma de `package.json:10`.
2. Extender `src/config.js:1` con `export const JWT_SECRET/JWT_EXPIRES_IN`, throw si falta `JWT_SECRET`.
3. Encode `DATABASE_URL` (`Grupo Alfa` -> `Grupo%20Alfa`) o usar `DB_*` separados.
4. Eliminar `src/config/db.js`.

### Fase 1 - `src/index.js:1`
```js
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
config(); // antes de importar PORT/JWT
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", usuariosRoutes);
app.use(notFound);
app.use(errorHandler);
```

### Fase 2 - `src/middleware/authMiddleware.js:6`
- Cambiar a `pool.query`, seleccionar solo columnas públicas, asignar `req.user`, manejar `TokenExpiredError` vs `JsonWebTokenError`.

### Fase 3 - `src/middleware/errorMiddleware.js:7`
- Reemplazar ramas `Prisma.*` por `pg`: `23505` unique -> 400/409, `23503` FK -> 409, `22P02` tipo inválido -> 400.

### Fase 4 - `src/controllers/usuarios.controllers.js:1`
- Añadir `try/catch` o `asyncHandler` en todos; helper `sanitize`.
- `getUsuarios`/`getUsuarioById`: excluir `contraseña`, 404 si no existe, validar `id`.
- `createUsuario`: validar duplicado con 2 queries separadas, `bcrypt.hash`, `INSERT ... RETURNING` sin `contraseña`, `201`.
- `login`: lookup por `nro_carnet` **o** `correo_electronico` (no `OR` ambiguo), `return` temprano, solo `bcrypt.compare`, `200`, sin hash.
- `updateUsuario`: 404, check conflicto email, hashear si viene `contraseña`, update dinámico, `RETURNING` sin hash.
- `deleteUsuario`: `204 .send()` sin body, manejar `23503`.
- Reescribir `existe()`.

### Fase 5 - `src/routes/usuarios.routes.js:1`
```js
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createUsuarioSchema, loginUsuarioSchema, updateUsuarioSchema } from "../validators/usuariosValidators.js";
router.post("/usuarios", validateRequest(createUsuarioSchema), createUsuario);
router.post("/usuarios/login", validateRequest(loginUsuarioSchema), login);
router.post("/usuarios/logout", logout);
router.get("/usuarios", authMiddleware, getUsuarios);
router.get("/usuarios/:id", authMiddleware, getUsuarioById);
router.put("/usuarios/:id", authMiddleware, validateRequest(updateUsuarioSchema), updateUsuario);
router.delete("/usuarios/:id", authMiddleware, deleteUsuario);
```
- Corregir también `src/routes/asesores.routes.js` y `src/controllers/asesores_controllers.js:19` (SQL injection).

### Fase 6 - `src/validators/usuariosValidators.js:1` y `src/utils/generateToken.js:3`
- `usuario_vigente: z.coerce.boolean().optional().default(true)`
- `loginSchema` transforma `password` -> `contraseña` y exige una credencial + contraseña.
- `validateRequest.js:7` mejorar flatten a `issues.map(i=>path: message)`.

### Fase 7 - Verificación
- `node --check`, `npm run dev`, `curl`:
  - `POST /api/usuarios` -> 201 + `Set-Cookie: jwt=... HttpOnly`
  - Duplicado -> 400
  - `POST /api/usuarios/login` por carnet y por email -> 200 + cookie
  - `GET /api/usuarios` sin token 401 / con Bearer 200 sin `contraseña`
  - `PUT` con nueva contraseña -> login nueva ok, vieja falla
  - `DELETE` -> 204, GET posterior 404

## Archivos a tocar
`package.json`, `src/config.js`, `src/index.js`, `src/middleware/authMiddleware.js`, `src/middleware/errorMiddleware.js`, `src/middleware/validateRequest.js`, `src/controllers/usuarios.controllers.js`, `src/routes/usuarios.routes.js`, `src/validators/usuariosValidators.js`, `src/utils/generateToken.js`, borrar `src/config/db.js`.

## Riesgos
- `Usuario_vigente` vs `usuario_vigente` case sensitive en Postgres si se creó con comillas; verificar `\d usuarios`.
- Prefijo `/api` es breaking change; mantener legacy dual si se requiere compatibilidad.
