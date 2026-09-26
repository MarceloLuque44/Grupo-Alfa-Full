# Registro, login backend y paleta azul/blanco

> Fecha: 2026-09-19. Skill aplicada: `react-vite-best-practices`. Logo: `src/imagenes/grupoAlfa.jpg`.

## 1. Qué cambió

### Auth contra el backend (antes: validación en cliente)
- `src/services/usersService.js`
  - `registerUsuario(payload)` → `POST /usuarios` (ruta pública). Devuelve `{ user, token }` desde `201 { estado, datos, token }`.
  - `loginUsuario({ correo_electronico, contraseña })` → `POST /usuarios/login` (bcrypt en servidor). Devuelve `{ user, token }`.
  - Errores normalizados en `error.userMessage`: 400 (zod) → mensaje del backend; 409 (carnet/correo duplicado) → conflicto; 401 → credenciales; sin respuesta → sin conexión.
  - Se corrigió la ruta de `fetchUsers` (`/api/usuarios` → `/usuarios`; el `baseURL` ya incluye `/api`, la forma anterior generaba `/api/api/usuarios`).
- Contrato backend (`C:\CODIGO\GrupoAlfa`): `POST /api/usuarios` exige `nro_carnet` int +, `apellido_paterno/materno`, `nombre`, `fecha_nacimiento` válida, `correo` email, `contraseña` min 8, `usuario_vigente` default true. Responde `201 { estado, datos, token }`.

### Pantallas
- `src/components/features/auth/RegisterScreen.jsx` (nuevo, lazy → chunk propio `RegisterScreen-*.js`)
  - 7 campos del zod + confirmar contraseña; validación cliente espejo (email, min 8, coincidencia, fecha válida).
  - Al `201` llama `onRegistered(user, token)` → entra directo al dashboard con sesión persistida (`ga_token/ga_user`).
- `src/components/features/auth/LoginScreen.jsx`
  - Migrado de comparación en texto plano contra `GET /usuarios` a `POST /usuarios/login` (imprescindible: los passwords nuevos van hasheados con bcrypt).
  - Props: ya no recibe `users`; recibe `onGoRegister`. Botón "¿No tienes cuenta? Regístrate" con prefetch del chunk de registro en `onMouseEnter/onFocus` (`split-prefetch-hints`).
- `src/app/App.jsx`
  - Estado `authView: login | register` (sin añadir react-router → bundle intacto). `RegisterScreen` y `DashboardShell` en `lazy` con `Suspense` propio cada uno (`split-suspense-boundaries`).
  - `signIn(user, token)` persiste token; al cerrar sesión se resetea a `login`.
- `src/components/ui/BrandLogo.jsx` (nuevo)
  - `import logoUrl from '../../imagenes/grupoAlfa.jpg'` → hashing en build (`assets/grupoAlfa-[hash].jpg`, `asset-public-dir`), con `width/height/alt/loading/decoding` (`asset-image-optimization`). Usado en login, registro y `Sidebar` (44 px + nombre). `BrandMark` queda legacy (solo lo usa `WelcomeScreen`, en desuso).
- `src/hooks/useCrud.js`: `initialParams` vía `useRef` (corrige warning `exhaustive-deps`); `src/components/dashboard/DataTable.jsx`: `propTypes` en fila memoizada. `npm run lint` limpio.

### Paleta azul/blanco (antes: verde/crema/naranja)
Variables en `:root`: `--navy #0a2540`, `--navy-deep #071a30`, `--blue #1565c0`, `--blue-light #1e88e5`, superficies `#ffffff`, fondo contenido `#eef3f9`, texto `#0a2540`, muted `#5b6b82`, bordes `#c9d6e8/#dbe5f2`.
Afectado en `src/App.css`: fondo login (gradiente azul), tarjetas blancas, `eyebrow`/botones/enlaces azules, foco de inputs azul, sidebar azul profundo con item activo blanco, `dashboard-main` `#eef3f9`, cabecera de tabla azul oscuro, modales blancos, backdrop azul. Nuevo: `.brand-logo` (img circular 50 %), `.link-button.center`.
Restos intencionales sin migrar: `.brand-mark` legacy y tonos del shimmer del skeleton (no visibles en uso normal).

## 2. Verificación
- `npm run lint` → limpio. `npm run build` → OK; chunks: `vendor-react`, `vendor-http`, `RegisterScreen`, `CrudPage`, `DashboardHome`, `DashboardShell`, logo con hash.
- Pendiente manual (`npm run dev`): registro válido → entra al dashboard; duplicado → 409; password <8/email inválido → 400; login de usuario nuevo (bcrypt) OK; toggle login↔registro; logo en login/registro/sidebar; sin restos naranja/verde visibles.

## 3. Riesgos / notas
- `GET /usuarios` exige auth: `useUsers`/`fetchUsers` ya no se usan en el flujo de login; si nada más los usa, pueden retirarse.
- Si el backend Railway no tiene desplegados los CRUD académicos, el dashboard muestra "—"/error por tarjeta pero auth y registro funcionan igual.
