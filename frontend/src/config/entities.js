export const ENTITIES = {
  dashboard: {
    key: "dashboard",
    label: "Dashboard",
    endpoint: null,
    pk: null,
    columns: [],
    fields: [],
  },
  usuarios: {
    key: "usuarios",
    label: "Usuarios",
    path: "/app/usuarios",
    endpoint: "usuarios",
    pk: "id_usuario",
    columns: [
      { key: "nro_carnet", label: "Carnet" },
      { key: "nombre_completo", label: "Nombre" },
      { key: "correo_electronico", label: "Correo" },
      { key: "vigente", label: "Vigente" },
      { key: "rol", label: "Rol" },
    ],
    fields: [
      { name: "nro_carnet", label: "Nro de carnet", type: "number", required: true },
      { name: "apellido_paterno", label: "Apellido paterno", type: "text", required: true, maxLength: 100 },
      { name: "apellido_materno", label: "Apellido materno", type: "text", required: true, maxLength: 100 },
      { name: "nombre", label: "Nombre", type: "text", required: true, maxLength: 100 },
      { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true },
      { name: "correo_electronico", label: "Correo electrónico", type: "text", required: true, maxLength: 150 },
      { name: "contraseña", label: "Contraseña", type: "password", required: true },
      { name: "usuario_vigente", label: "Usuario vigente", type: "checkbox", required: false },
    ],
    hint: "La contraseña debe tener al menos 8 caracteres. En edición, déjala vacía para no cambiarla.",
  },
  materias: {
    key: "materias",
    label: "Materias",
    path: "/app/materias",
    endpoint: "materias",
    pk: "id_materia",
    columns: [
      { key: "id_materia", label: "ID" },
      { key: "nombre_materia", label: "Nombre" },
    ],
    fields: [
      { name: "nombre_materia", label: "Nombre de la materia", type: "text", required: true, maxLength: 150 },
    ],
  },
  asesores: {
    key: "asesores",
    label: "Asesores",
    path: "/app/asesores",
    endpoint: "asesores",
    pk: "id_asesor",
    columns: [
      { key: "id_asesor", label: "ID" },
      { key: "nombre_completo", label: "Asesor" },
      { key: "correo_electronico", label: "Correo" },
    ],
    fields: [
      { name: "id_usuario", label: "ID de usuario (nro_carnet)", type: "number", required: true },
    ],
    hint: "El id_usuario debe existir en usuarios.",
  },
  capacitaciones: {
    key: "capacitaciones",
    label: "Capacitaciones",
    path: "/app/capacitaciones",
    endpoint: "capacitaciones",
    pk: "id_capacitacion",
    columns: [
      { key: "id_capacitacion", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "nivel", label: "Nivel" },
      { key: "modalidad", label: "Modalidad" },
      { key: "fecha_inicio", label: "Inicio" },
    ],
    fields: [
      { name: "id_convocatoria", label: "ID convocatoria", type: "number", required: true },
      { name: "id_aula", label: "ID aula", type: "number", required: true },
      { name: "nombre", label: "Nombre", type: "text", required: true, maxLength: 150 },
      { name: "nivel", label: "Nivel", type: "text", required: false, maxLength: 100 },
      { name: "modalidad", label: "Modalidad", type: "text", required: false, maxLength: 50 },
      { name: "fecha_inicio", label: "Fecha de inicio", type: "date", required: false },
      { name: "hora_inicio", label: "Hora inicio", type: "time", required: false },
      { name: "hora_fin", label: "Hora fin", type: "time", required: false },
    ],
    hint: "id_convocatoria e id_aula son obligatorios y deben existir (RESTRICT).",
  },
  temas: {
    key: "temas",
    label: "Temas",
    path: "/app/temas",
    endpoint: "temas",
    pk: "id_tema",
    columns: [
      { key: "id_tema", label: "ID" },
      { key: "nombre_tema", label: "Tema" },
      { key: "nombre_materia", label: "Materia" },
    ],
    fields: [
      { name: "nombre_tema", label: "Nombre del tema", type: "text", required: true, maxLength: 150 },
      { name: "id_materia", label: "ID materia (opcional)", type: "number", required: false },
    ],
    filterable: true,
  },
  estudiantes: {
    key: "estudiantes",
    label: "Estudiantes",
    path: "/app/estudiantes",
    endpoint: "estudiantes",
    pk: "id_estudiante",
    columns: [
      { key: "id_estudiante", label: "ID" },
      { key: "nombre_completo", label: "Estudiante" },
      { key: "colegio_de_procedencia", label: "Colegio" },
      { key: "direccion_de_domicilio", label: "Dirección" },
    ],
    fields: [
      { name: "id_usuario", label: "ID de usuario (nro_carnet)", type: "number", required: true },
      { name: "id_apoderado", label: "ID apoderado (opcional)", type: "number", required: false },
      { name: "colegio_de_procedencia", label: "Colegio de procedencia", type: "text", required: false, maxLength: 150 },
      { name: "direccion_de_domicilio", label: "Dirección de domicilio", type: "text", required: false, maxLength: 255 },
    ],
    hint: "No se gestiona la foto por API en esta versión.",
  },
}

export const ENTITY_ORDER = ["usuarios", "materias", "asesores", "capacitaciones", "temas", "estudiantes"]

export function getDisplayName(row) {
  const parts = [row.nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean)
  if (parts.length > 0) return parts.join(" ")
  return row.nombre_completo ?? row.correo_electronico ?? ""
}
