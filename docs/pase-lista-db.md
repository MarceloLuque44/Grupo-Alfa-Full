# Plan: persistir el pase de lista en la base de datos

## 1. Objetivo

Al presionar **Guardar lista** en la pestaña Tomar clase:
1. la lista se manda a la base de datos (tablas `clases` + `asistencias`), y
2. se guarda en `localStorage` **solamente la última lista** (sobrescribe, no acumula).

## 2. Decisiones cerradas

1. **Sin endpoints nuevos.** Se reutilizan los existentes (fase 2, verificados en vivo):
   - `POST /api/clases` — `{id_curso_capacitacion, id_asesor, id_tema?, inicioClase}` (fecha ISO 8601).
   - `POST /api/asistencias` — `{id_clase, id_estudiante, hora_entrada, salida_antes_de_tiempo?, permiso?, razon_permiso?}` (timestamps ISO 8601).
   - `GET /api/clases`, `GET /api/asistencias?id_clase=` — futura migración de la pestaña Asistencias a BD.
2. **`localStorage` guarda solo la última.** Clave `ga_pase_lista` pasa de array acumulativo a **objeto único** (la última lista). `readListas()` debe aceptar ambos formatos para no romper listas guardadas con el formato viejo.
3. **Mapeo formulario → `clases`.** La tabla no tiene columnas de materia/aula/horario (son informativos):
   - `id_curso_capacitacion` = curso elegido, `id_asesor` = asesor elegido.
   - `inicioClase` = fecha del formulario.
   - `id_tema`: se resuelve buscando el tema por nombre (`GET /temas`, match por `nombre_tema`); si no existe, `null` (columna nulleable, `SET NULL`).
   - Aula/horario/materia se conservan en el payload local y en el modal, igual que hoy.
4. **Mapeo marca → `asistencias`** (convención a confirmar):
   - Presente → `hora_entrada` = fecha + hora actual, sin `permiso`.
   - Ausente → `hora_entrada` + `permiso: false`.
   - Sin marcar → no se crea registro.
5. **Orden y atomicidad parcial.** Primero `POST /clases`; con su `id_clase`, `POST /asistencias` por alumno marcado (`Promise.allSettled`). Si falla la clase, no se crea nada y se muestra el error; si fallan asistencias sueltas, se informa cuántas fallaron. Sin transacción (el API no expone endpoint transaccional).
6. **Errores visibles.** 400 (zod) / 409 (FK) del backend se muestran en el `span` de `guardado`; el `localStorage` solo se sobrescribe si la BD respondió OK (la última lista local = última lista persistida).

## 3. Archivos a modificar (solo frontend)

| Archivo | Cambio |
|---|---|
| `src/components/pase-lista/TomarClaseTab.jsx` | `handleGuardar` async: resolver tema → `POST clases` → `POST asistencias` × N → sobrescribir `localStorage` con el payload + `id_clase` → `onSaved()`. Manejo de errores por caso. |
| `src/components/pase-lista/AsistenciasTab.jsx` | `readListas()`: aceptar array (formato viejo) u objeto único (formato nuevo). Resto sin cambios en esta fase. |
| `src/services/paseListaService.js` (opcional) | Helpers `resolverTemaPorNombre()` y `guardarAsistenciaEnBD()` para no engordar el componente. |

## 4. Casos borde

- Sin alumnos marcados → no se llama al API (aviso "marca al menos un estudiante").
- Tema escrito que no existe en `/temas` → `id_tema: null`, la clase se crea igual.
- `id_asesor`/`id_curso` inexistentes → 409 del backend, se muestra el mensaje.
- `localStorage` lleno o deshabilitado → se informa, la BD ya quedó guardada.
- Doble clic en Guardar → deshabilitar botón mientras `saving` (hoy no hay estado de guardado en ese tab).

## 5. Verificación

1. `npm run build` en `frontend`.
2. Smoke contra BD real con servidor temporal (como en fase 2): login → `POST /clases` → `POST /asistencias` → `GET /asistencias?id_clase=` → `DELETE` de limpieza.
3. Comprobar en navegador: tras guardar, `localStorage.ga_pase_lista` es un objeto (no array) y un segundo guardado lo reemplaza.

## 6. Fuera de alcance (siguientes fases)

- Pestaña Asistencias leída desde BD (`GET /clases` + `GET /asistencias`, agrupando en cliente) con fallback a la última local.
- Eliminar lista BD: `DELETE /api/clases/:id` (cascada a asistencias) con manejo del 409 si tiene avances.
- Migrar/eliminar el formato array viejo de `localStorage`.
