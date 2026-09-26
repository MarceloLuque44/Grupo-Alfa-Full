import { NavLink } from "react-router-dom"
import BrandLogo from "../ui/BrandLogo"
import { ENTITIES, ENTITY_ORDER } from "../../config/entities"

const lazyCrud = () => import("./CrudPage.jsx")
const lazyHome = () => import("./DashboardHome.jsx")
const lazyPaseLista = () => import("../../pages/app/PaseListaPage.jsx")

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandLogo size={44} withName />
      </div>
      <nav aria-label="Navegación principal">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onMouseEnter={lazyHome}
          onFocus={lazyHome}
        >
          Dashboard
        </NavLink>
        {ENTITY_ORDER.map((key) => (
          <NavLink
            key={key}
            to={ENTITIES[key].path}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onMouseEnter={lazyCrud}
            onFocus={lazyCrud}
          >
            {ENTITIES[key].label}
          </NavLink>
        ))}
        <NavLink
          to="/app/pase-lista"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onMouseEnter={lazyPaseLista}
          onFocus={lazyPaseLista}
        >
          Llamar lista
        </NavLink>
      </nav>
    </aside>
  )
}
