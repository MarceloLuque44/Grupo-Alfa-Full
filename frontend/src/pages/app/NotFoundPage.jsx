import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <section className="error-panel">
      <h2>Página no encontrada</h2>
      <p className="muted">La ruta que buscas no existe.</p>
      <Link to="/app/dashboard">Volver al dashboard</Link>
    </section>
  )
}
