import { Suspense, lazy } from "react"
import { useParams } from "react-router-dom"
import CrudPage from "../../components/dashboard/CrudPage"
import ErrorFallback from "../../components/ui/ErrorFallback"
import Skeleton from "../../components/ui/Skeleton"
import { ENTITIES } from "../../config/entities"

const UsuariosPage = lazy(() => import("./UsuariosPage"))
const CapacitacionesPage = lazy(() => import("./CapacitacionesPage"))

export default function EntityPage() {
  const { entityKey } = useParams()
  const entity = ENTITIES[entityKey]

  if (!entity || !entity.endpoint) {
    return <ErrorFallback message="Módulo no encontrado." />
  }
  if (entity.key === "usuarios") {
    return (
      <Suspense fallback={<Skeleton lines={6} />}>
        <UsuariosPage />
      </Suspense>
    )
  }
  if (entity.key === "capacitaciones") {
    return (
      <Suspense fallback={<Skeleton lines={6} />}>
        <CapacitacionesPage />
      </Suspense>
    )
  }
  return <CrudPage key={entity.key} entity={entity} />
}
