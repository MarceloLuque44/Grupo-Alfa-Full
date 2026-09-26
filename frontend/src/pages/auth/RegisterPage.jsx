import { Navigate, useNavigate } from "react-router-dom"
import RegisterScreen from "../../components/features/auth/RegisterScreen"
import { useAuth } from "../../hooks/useAuth"

export default function RegisterPage() {
  const { loggedUser, signIn } = useAuth()
  const navigate = useNavigate()

  if (loggedUser) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <RegisterScreen
      onRegistered={(user, token) => {
        signIn(user, token)
        navigate("/app/dashboard", { replace: true })
      }}
      onGoLogin={() => navigate("/login")}
    />
  )
}
