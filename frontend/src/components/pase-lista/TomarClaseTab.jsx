import { Suspense, lazy, useEffect, useMemo, useState } from "react"
import Skeleton from "../ui/Skeleton"
import Button from "../ui/Button"
import { listResource } from "../../services/academicService"
import { loadEstudiantesPorCurso } from "../../services/paseListaService"

// split-dynamic-imports: la tabla solo se carga cuando hay curso seleccionado.
const PaseListaTable = lazy(() => import("./PaseListaTable.jsx"))

const initialForm = {
  idMateria: "",
  idAsesor: "",
  horario: "",
  idCurso: "",
  aula: "",
  fecha: new Date().toISOString().slice(0, 10),
  temaAvanzado: "",
}

function userName(u) {
  if (!u) return ""
  const full = [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(" ")
  return full || u.nombre_completo || u.correo_electronico || `Usuario ${u.id_usuario ?? u.nro_carnet ?? ""}`
}

export default function TomarClaseTab({ catalogs, onSaved }) {
  const [form, setForm] = useState(initialForm)
  const [alumnos, setAlumnos] = useState([])
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)
  const [alumnosNota, setAlumnosNota] = useState("")
  const [asistencia, setAsistencia] = useState({})
  const [guardado, setGuardado] = useState("")

  const usuariosById = useMemo(() => {
    const map = new Map()
    for (const u of catalogs.usuarios ?? []) {
      map.set(String(u.id_usuario ?? u.nro_carnet), u)
    }
    return map
  }, [catalogs.usuarios])

  const nombreEstudiante = (est) =>
    est.nombre_completo ??
    userName(usuariosById.get(String(est.id_usuario))) ??
    `Estudiante ${est.id_estudiante}`

  const cursoSeleccionado = useMemo(
    () => (catalogs.capacitaciones ?? []).find((c) => String(c.id_capacitacion) === String(form.idCurso)),
    [catalogs.capacitaciones, form.idCurso],
  )

  // Al elegir curso: autocompleta aula/horario y carga la lista de abajo.
  useEffect(() => {
    let mounted = true
    async function loadAlumnos() {
      if (!form.idCurso) {
        setAlumnos([])
        setAlumnosNota("")
        setAsistencia({})
        return
      }
      setLoadingAlumnos(true)
      setGuardado("")
      try {
        if (cursoSeleccionado) {
          setForm((prev) => ({
            ...prev,
            aula: prev.aula || String(cursoSeleccionado.id_aula ?? ""),
            horario:
              prev.horario ||
              [cursoSeleccionado.hora_inicio, cursoSeleccionado.hora_fin].filter(Boolean).join(" - "),
          }))
        }
        const matriculas = await loadEstudiantesPorCurso(form.idCurso)
        let lista = []
        let nota = ""
        if (Array.isArray(matriculas) && matriculas.length > 0) {
          const ids = new Set(matriculas.map((m) => String(m.id_estudiante ?? m.estudiante ?? "")))
          lista = (catalogs.estudiantes ?? []).filter((e) => ids.has(String(e.id_estudiante)))
          if (lista.length === 0) lista = matriculas
        } else {
          const todos = await listResource("estudiantes").catch(() => catalogs.estudiantes ?? [])
          lista = Array.isArray(todos) ? todos : []
          nota = "El backend aún no expone matriculaciones por curso; se muestran todos los estudiantes registrados."
        }
        if (mounted) {
          setAlumnos(lista)
          setAlumnosNota(nota)
          setAsistencia({})
        }
      } catch {
        if (mounted) {
          setAlumnos([])
          setAlumnosNota("No se pudo cargar la lista de estudiantes.")
        }
      } finally {
        if (mounted) setLoadingAlumnos(false)
      }
    }
    loadAlumnos()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.idCurso])

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setGuardado("")
  }

  const toggleAsistencia = (idEstudiante, presente) => {
    setAsistencia((prev) => ({ ...prev, [idEstudiante]: presente }))
    setGuardado("")
  }

  const marcarTodos = (presente) => {
    setAsistencia(Object.fromEntries(alumnos.map((a) => [a.id_estudiante ?? a.id, presente])))
    setGuardado("")
  }

  const resumen = useMemo(() => {
    const values = Object.values(asistencia)
    return {
      presentes: values.filter(Boolean).length,
      ausentes: values.filter((v) => v === false).length,
      sinMarcar: alumnos.length - values.length,
    }
  }, [asistencia, alumnos.length])

  const handleGuardar = () => {
    const payload = {
      ...form,
      curso: cursoSeleccionado?.nombre ?? "",
      lista: alumnos.map((a) => ({
        id_estudiante: a.id_estudiante ?? a.id,
        nombre: nombreEstudiante(a),
        presente: asistencia[a.id_estudiante ?? a.id] ?? null,
      })),
    }
    try {
      const prev = JSON.parse(localStorage.getItem("ga_pase_lista") ?? "[]")
      prev.push({ guardadoEn: new Date().toISOString(), ...payload })
      localStorage.setItem("ga_pase_lista", JSON.stringify(prev))
      setGuardado(`Lista guardada (${payload.lista.length} estudiante(s), ${resumen.presentes} presente(s)). Ver pestaña Asistencias.`)
      onSaved?.()
    } catch {
      setGuardado("No se pudo guardar la lista en este navegador.")
    }
  }

  return (
    <section>
      <p className="muted">Completa los datos de la clase y marca la asistencia de la tabla inferior.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleGuardar() }}
          style={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
        >
          <div className="form-row">
            <label htmlFor="pl-materia">Materia</label>
            <select id="pl-materia" value={form.idMateria} onChange={(e) => setField("idMateria", e.target.value)} required>
              <option value="">Selecciona…</option>
              {(catalogs.materias ?? []).map((m) => (
                <option key={m.id_materia} value={m.id_materia}>{m.nombre_materia}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="pl-asesor">Asesor</label>
            <select id="pl-asesor" value={form.idAsesor} onChange={(e) => setField("idAsesor", e.target.value)} required>
              <option value="">Selecciona…</option>
              {(catalogs.asesores ?? []).map((a) => (
                <option key={a.id_asesor} value={a.id_asesor}>
                  {a.nombre_completo ?? userName(usuariosById.get(String(a.id_usuario))) ?? `Asesor ${a.id_asesor}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="pl-horario">Horario</label>
            <input id="pl-horario" type="text" placeholder="Ej. 08:00 - 10:00" value={form.horario} onChange={(e) => setField("horario", e.target.value)} required />
          </div>

          <div className="form-row">
            <label htmlFor="pl-curso">Curso de capacitación</label>
            <select id="pl-curso" value={form.idCurso} onChange={(e) => setField("idCurso", e.target.value)} required>
              <option value="">Selecciona…</option>
              {(catalogs.capacitaciones ?? []).map((c) => (
                <option key={c.id_capacitacion} value={c.id_capacitacion}>
                  {c.nombre}{c.nivel ? ` (${c.nivel})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="pl-aula">Aula</label>
            <input id="pl-aula" type="text" placeholder="Ej. A-101" value={form.aula} onChange={(e) => setField("aula", e.target.value)} required />
          </div>

          <div className="form-row">
            <label htmlFor="pl-fecha">Fecha</label>
            <input id="pl-fecha" type="date" value={form.fecha} onChange={(e) => setField("fecha", e.target.value)} required />
          </div>

          <div className="form-row">
            <label htmlFor="pl-tema">Tema avanzado</label>
            <input id="pl-tema" type="text" list="pl-temas" placeholder="Tema visto en clase" value={form.temaAvanzado} onChange={(e) => setField("temaAvanzado", e.target.value)} required />
            <datalist id="pl-temas">
              {(catalogs.temas ?? []).map((t) => (
                <option key={t.id_tema} value={t.nombre_tema} />
              ))}
            </datalist>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Estudiantes del curso</h3>
        {!form.idCurso ? (
          <p className="muted">Elige un curso de capacitación para ver su lista de estudiantes.</p>
        ) : loadingAlumnos ? (
          <Skeleton lines={5} />
        ) : alumnos.length === 0 ? (
          <p className="muted">No hay estudiantes registrados en este curso.</p>
        ) : (
          <Suspense fallback={<Skeleton lines={5} />}>
            <PaseListaTable
              alumnos={alumnos}
              nombreDe={nombreEstudiante}
              asistencia={asistencia}
              onToggle={toggleAsistencia}
              onMarcarTodos={marcarTodos}
              resumen={resumen}
              nota={alumnosNota}
            />
          </Suspense>
        )}
      </div>

      {form.idCurso && alumnos.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Button type="button" onClick={handleGuardar}>Guardar lista</Button>
          {guardado && <span className="muted">{guardado}</span>}
        </div>
      )}
    </section>
  )
}
