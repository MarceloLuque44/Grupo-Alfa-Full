import { Navigate, useLocation } from "react-router-dom"
import PropTypes from "prop-types"
import { useAuth } from "../../hooks/useAuth"

export default function RequireAuth({ children }) {
  const { loggedUser } = useAuth()
  const location = useLocation()

  if (!loggedUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
}
