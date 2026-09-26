import { Suspense, lazy, useState } from "react"
import { ENTITIES } from "../../config/entities"
import Skeleton from "../../components/ui/Skeleton"

// split-component-lazy: el CRUD (pesado: tabla + modal + formulario) vive en su
// propio chunk y solo se monta la pestaña activa — las inactivas no piden datos.
// split-prefetch-hints: `preloadCrud` calienta el chunk al pasar el cursor/foco
// por una pestaña antes del clic.
const loadCrud = () => import("../../components/dashboard/CrudPage.jsx")
const CrudPanel = lazy(loadCrud)
const preloadCrud = () => loadCrud()

const TABS = ["capacitaciones", "convocatorias", "facultades", "aulas"]

export default function CapacitacionesPage() {
  const [active, setActive] = useState("capacitaciones")
  const entity = ENTITIES[active]

  return (
    <section>
      <div className="toggle-group" role="tablist" aria-label="Módulos de capacitaciones">
        {TABS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={active === key}
            type="button"
            className={active === key ? "toggle-chip active" : "toggle-chip"}
            onClick={() => setActive(key)}
            onMouseEnter={preloadCrud}
            onFocus={preloadCrud}
          >
            {ENTITIES[key].label}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        {active === "capacitaciones" && "Cursos de capacitación. Requieren convocatoria y aula existentes."}
        {active === "convocatorias" && "Convocatorias de preuniversitario. Requieren facultad existente."}
        {active === "facultades" && "Facultades a las que pertenecen carreras y convocatorias."}
        {active === "aulas" && "Aulas donde se dictan los cursos."}
      </p>
      <Suspense fallback={<Skeleton lines={6} />}>
        <CrudPanel key={entity.key} entity={entity} />
      </Suspense>
    </section>
  )
}
