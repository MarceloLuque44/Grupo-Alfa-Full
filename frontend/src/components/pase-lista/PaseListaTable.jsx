import PropTypes from "prop-types"
import Button from "../ui/Button"

export default function PaseListaTable({ alumnos, nombreDe, asistencia, onToggle, onMarcarTodos, resumen, nota }) {
  return (
    <div>
      {nota && <p className="warning-message">{nota}</p>}
      <div className="crud-toolbar">
        <Button size="sm" variant="secondary" onClick={() => onMarcarTodos(true)}>Todos presentes</Button>
        <Button size="sm" variant="secondary" onClick={() => onMarcarTodos(false)}>Todos ausentes</Button>
        <span className="muted">
          {alumnos.length} estudiante(s) · {resumen.presentes} presente(s) · {resumen.ausentes} ausente(s) · {resumen.sinMarcar} sin marcar
        </span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Estudiante</th>
              <th>Colegio</th>
              <th>Presente</th>
              <th>Ausente</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a, i) => {
              const id = a.id_estudiante ?? a.id ?? i
              const estado = asistencia[id]
              return (
                <tr key={id}>
                  <td>{i + 1}</td>
                  <td>{nombreDe(a)}</td>
                  <td>{a.colegio_de_procedencia ?? "—"}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={estado === true}
                      onChange={() => onToggle(id, true)}
                      aria-label={`Marcar presente a ${nombreDe(a)}`}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={estado === false}
                      onChange={() => onToggle(id, false)}
                      aria-label={`Marcar ausente a ${nombreDe(a)}`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

PaseListaTable.propTypes = {
  alumnos: PropTypes.array.isRequired,
  nombreDe: PropTypes.func.isRequired,
  asistencia: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onMarcarTodos: PropTypes.func.isRequired,
  resumen: PropTypes.object.isRequired,
  nota: PropTypes.string,
}
