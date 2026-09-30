import { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import Modal from "../ui/Modal"
import Button from "../ui/Button"

const STORAGE_KEY = "ga_pase_lista"

function readListas() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function estadoLabel(presente) {
  if (presente === true) return "Presente"
  if (presente === false) return "Ausente"
  return "Sin marcar"
}

function ListaDetalleModal({ lista, materia, asesor, onClose, onDelete }) {
  const presentes = lista.lista.filter((e) => e.presente === true).length
  const ausentes = lista.lista.filter((e) => e.presente === false).length

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <Modal
      title={`Asistencia — ${lista.curso || "Curso"} (${lista.fecha || "s/fecha"})`}
      hint={`Guardada el ${lista.guardadoEn ? new Date(lista.guardadoEn).toLocaleString() : "—"}. ${presentes} presente(s), ${ausentes} ausente(s).`}
      onClose={onClose}
    >
      <Modal.Body>
        <p className="muted" style={{ marginTop: 0 }}>
          Materia: <strong>{materia}</strong> · Asesor: <strong>{asesor}</strong> · Horario: <strong>{lista.horario || "—"}</strong>
          {" · "}Aula: <strong>{lista.aula || "—"}</strong> · Tema: <strong>{lista.temaAvanzado || "—"}</strong>
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Estudiante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.lista.map((est, i) => (
                <tr key={est.id_estudiante ?? i}>
                  <td>{i + 1}</td>
                  <td>{est.nombre}</td>
                  <td>{estadoLabel(est.presente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal.Footer>
          <Button variant="secondary" onClick={onDelete}>
            Eliminar lista
          </Button>
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default function AsistenciasTab({ catalogs, version }) {
  const [listas, setListas] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setListas(readListas())
    setSelected(null)
  }, [version])

  const nombres = useMemo(() => {
    const usersById = new Map((catalogs.usuarios ?? []).map((u) => [String(u.id_usuario ?? u.nro_carnet), u]))
    const materiaById = new Map((catalogs.materias ?? []).map((m) => [String(m.id_materia), m.nombre_materia]))
    const userName = (u) => {
      if (!u) return ""
      const full = [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(" ")
      return full || u.nombre_completo || u.correo_electronico || ""
    }
    const asesorById = new Map(
      (catalogs.asesores ?? []).map((a) => [
        String(a.id_asesor),
        a.nombre_completo ?? userName(usersById.get(String(a.id_usuario))) ?? `Asesor ${a.id_asesor}`,
      ]),
    )
    return { materiaById, asesorById }
  }, [catalogs])

  const materiaDe = (lista) => nombres.materiaById.get(String(lista.idMateria)) ?? "—"
  const asesorDe = (lista) => nombres.asesorById.get(String(lista.idAsesor)) ?? "—"

  const handleDelete = (index) => {
    if (!window.confirm("¿Eliminar esta lista de asistencia?")) return
    const next = listas.filter((_, i) => i !== index)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // si falla el storage, igual se actualiza la vista
    }
    setListas(next)
    setSelected(null)
  }

  if (listas.length === 0) {
    return (
      <section>
        <p className="muted">Aún no se tomó ninguna lista. Ve a la pestaña Tomar clase para registrar la primera.</p>
      </section>
    )
  }

  return (
    <section>
      <p className="muted">{listas.length} lista(s) tomada(s). Haz clic en una fila para ver su contenido.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Curso</th>
              <th>Materia</th>
              <th>Tema avanzado</th>
              <th>Presentes</th>
              <th>Ausentes</th>
            </tr>
          </thead>
          <tbody>
            {listas.map((lista, i) => (
              <tr key={`${lista.guardadoEn ?? i}-${i}`} onClick={() => setSelected(i)} style={{ cursor: "pointer" }}>
                <td>{lista.fecha || "—"}</td>
                <td>{lista.curso || "—"}</td>
                <td>{materiaDe(lista)}</td>
                <td>{lista.temaAvanzado || "—"}</td>
                <td>{lista.lista.filter((e) => e.presente === true).length}</td>
                <td>{lista.lista.filter((e) => e.presente === false).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected != null && listas[selected] && (
        <ListaDetalleModal
          lista={listas[selected]}
          materia={materiaDe(listas[selected])}
          asesor={asesorDe(listas[selected])}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected)}
        />
      )}
    </section>
  )
}

AsistenciasTab.propTypes = {
  catalogs: PropTypes.object.isRequired,
  version: PropTypes.number.isRequired,
}
