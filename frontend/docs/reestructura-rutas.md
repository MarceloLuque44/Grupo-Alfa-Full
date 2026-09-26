# Reestructura: rutas + arquitectura de componentes

> Fecha: 2026-09-19. Skills: `react-component-architecture` (funcionales + hooks, composición/compuestos, custom hooks, HOC) y `react-vite-best-practices` (lazy por ruta, Suspense, prefetch, chunks).
> Decisión confirmada: instalar `react-router-dom` + refactor completo (rutas, layouts, ui kit, hooks). Nada de render condicional por estado.

## 1. Problema actual

- `src/app/App.jsx` renderiza por estado (`loggedUser`, `authView: login|register`, `activeKey`): sin URLs, sin deep-link, sin back/forward; `DashboardShell` recibe `activeKey/onNavigate` y decide (`DashboardHome` vs `CrudPage`).
- `Sidebar` usa botones + prefetch manual de un único chunk; `CrudPage` mezcla toolbar/tabla/modal; no hay ui kit (`Button/Card/Modal`); formularios con `useState` disperso sin validadores compartidos.
- `stores/authStore.js` es un hook con `useState` local: cada consumidor crea su propio estado → al haber varias rutas/guards habrá fuentes de verdad divergentes. Debe morir y pasar a contexto.

## 2. Mapa de rutas objetivo

```
/login, /registro                 AuthLayout (públicas; con sesión → redirect /app/dashboard)
/                                  redirect /app/dashboard
/app → DashboardLayout            guard RequireAuth (Sidebar + <Outlet />)
  /app/dashboard                   index, primera pantalla (tarjetas-contador)
  /app/materias | /app/asesores | /app/capacitaciones | /app/temas | /app/estudiantes
  *                                NotFoundPage
```

- Login OK → `navigate('/app/dashboard')`; registro `201` → sesión directa + `navigate('/app/dashboard')`; `RequireAuth` sin sesión → `<Navigate to="/login" />`; `signOut` → `/login`.
- `main.jsx`: `<BrowserRouter>` (si el hosting es estático sin fallback SPA, usar `HashRouter`).
- Eliminar `src/App.jsx` duplicado (reexport); `app/App.jsx` declara `<Routes>` con `lazy` por página y `Suspense` por rama (auth / app).

## 3. Estructura objetivo

```
src/
├── routes/
│   ├── router.jsx              # <Routes> + lazy por página + redirects + "*"
│   ├── guards/RequireAuth.jsx  # HOC guard de sesión
│   └── loaders/                # loaders por entidad (listResource; temas acepta ?id_materia=)
├── pages/                      # 1 componente/archivo, default export (Fast Refresh)
│   ├── auth/{LoginPage,RegisterPage}.jsx
│   └── app/{DashboardPage,EntityPage,NotFoundPage}.jsx
├── layouts/{AuthLayout,DashboardLayout}.jsx  # Sidebar + <Outlet />, header usuario
├── components/
│   ├── ui/                     # Button (variant/size), Card compuesto (.Header/.Body/.Footer),
│   │                           # Modal compuesto, TextField, Skeleton, ErrorFallback, BrandLogo
│   ├── features/auth/{LoginForm,RegisterForm}.jsx  # presentacionales (sin navegación)
│   └── features/entities/{EntityToolbar,EntityTable,EntityModal}.jsx
├── hooks/{useAuth,useCrud,useFormInput}.js
├── stores/authContext.jsx      # AuthProvider (loggedUser/token, localStorage ga_*) + useAuth
└── config/entities.js          # + `path` por entidad: { materias: '/app/materias', ... }
```

Patrones skill:

- **Composición/compuestos**: `Card.Header/Body/Footer`; `Modal` con `children`; `EntityPage` compone toolbar + tabla + modal según `entity` de la ruta; layouts componen `Sidebar + Outlet`.
- **Custom hook** `useFormInput({ initial, validator })` con `{ value, setValue, error, validate, reset, bind }` para login/registro/entidades.
- **HOC** `withLoader(Component)` para tablas (loading/error) en vez de `if` repetidos. Render props solo si un caso lo exige (no por defecto).

## 4. Cambios por archivo (resumen)

| Actual | Cambio |
|---|---|
| `app/App.jsx` (estados) | Solo `<Routes>`; mueren `authView/activeKey` |
| `dashboard/DashboardShell.jsx` | Se divide en `DashboardLayout` (marco) + páginas; muere prop `activeKey/onNavigate` |
| `dashboard/Sidebar.jsx` | Botones → `<NavLink to>` (activo automático) + prefetch por ruta en hover/focus |
| `features/auth/LoginScreen/RegisterScreen` | `Page` (carga guard + `navigate`) + `Form` presentacional con `useFormInput` + ui kit |
| `dashboard/CrudPage/DataTable/EntityFormModal` | `EntityPage` (lee entidad por ruta, usa loader) + `EntityToolbar/EntityTable/EntityModal` con `Button/Card/Modal/TextField` |
| `stores/authStore.js` | Sustituido por `stores/authContext.jsx` (única fuente de verdad) |
| `hooks/useUsers.js` | Se retira del flujo (el login ya usa `POST /usuarios/login`) |
| `vite.config.js` | `manualChunks['vendor-router']`, `optimizeDeps` + `react-router-dom` |

## 5. Orden de ejecución

1. Instalar `react-router-dom`; `vendor-router` en `vite.config`; `AuthProvider` + `RequireAuth` + `AuthLayout` + `DashboardLayout`.
2. `pages/` + `routes/router.jsx`; `Sidebar → NavLink`; navegación en login/registro (`useNavigate`); redirects y `*`.
3. UI kit (`Button/Card/Modal/TextField`) + `useFormInput` + `withLoader`; migrar formularios y entidades a composición.
4. Limpieza: borrar `App.jsx` duplicado, `authStore` viejo, `WelcomeScreen`/`BrandMark` en desuso (verificar antes).

## 6. Verificación

- `npm run lint` limpio; `npm run build` con chunk por página + `vendor-router` separado.
- Smoke: deep-link directo a `/app/temas` y `/app/materias`; guard redirige sin sesión; back/forward del navegador; CRUD por entidad (crear/editar/eliminar + 400/404/409); login/registro navegan; sidebar marca activa la ruta; `npm run dev` conserva estado con Fast Refresh.

## 7. Riesgos

- `BrowserRouter` sin fallback SPA en hosting → 404 al recargar subrutas (alternativa: `HashRouter`).
- Dos fuentes de auth durante la migración (contexto vs hook viejo) → migrar todos los consumidores a `useAuth` en el mismo cambio.
- `temas`: confirmar columna de nombre y filtro `?id_materia=` en el loader.
