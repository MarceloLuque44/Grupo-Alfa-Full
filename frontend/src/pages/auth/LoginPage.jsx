import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { LoginScreen } from "../../components/features/auth/LoginScreen"
import { useAuth } from "../../hooks/useAuth"

export default function LoginPage() {
  const { loggedUser, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? "/app/dashboard"

  if (loggedUser) {
    return <Navigate to={from} replace />
  }

  return (
    <LoginScreen
      isLoading={false}
      serverError=""
      onSignIn={(user, token) => {
        signIn(user, token)
        navigate(from, { replace: true })
      }}
      onGoRegister={() => navigate("/registro")}
    />
  )
}
