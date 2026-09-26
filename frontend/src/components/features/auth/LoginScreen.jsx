import { useState } from "react"
import PropTypes from "prop-types"
import LoginForm from "./LoginForm"
import { useFormInput } from "../../../hooks/useFormInput"
import { loginUsuario } from "../../../services/usersService"

const emailValidator = (value) =>
  /^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Debe ingresar un correo electrónico válido."

export function LoginScreen({ isLoading, serverError, onSignIn, onGoRegister }) {
  const email = useFormInput({ validator: emailValidator })
  const password = useFormInput()
  const [error, setError] = useState("")
  const [signingIn, setSigningIn] = useState(false)

  const preloadRegister = () => {
    import("./RegisterScreen.jsx")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    if (!email.validate() || !password.value) {
      setError(password.value ? email.error ?? "" : "La contraseña es obligatoria.")
      return
    }
    setSigningIn(true)
    try {
      const { user, token } = await loginUsuario({
        correo_electronico: email.value.trim(),
        contraseña: password.value,
      })
      onSignIn(user, token)
    } catch (err) {
      setError(err.userMessage ?? "El correo o la contraseña no son correctos.")
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <LoginForm
      email={email.value}
      password={password.value}
      error={error}
      serverError={serverError}
      disabled={isLoading || signingIn}
      onEmailChange={(event) => email.setValue(event.target.value)}
      onPasswordChange={(event) => password.setValue(event.target.value)}
      onSubmit={handleSubmit}
      onGoRegister={onGoRegister}
      onPreloadRegister={preloadRegister}
    />
  )
}

LoginScreen.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  serverError: PropTypes.string.isRequired,
  onSignIn: PropTypes.func.isRequired,
  onGoRegister: PropTypes.func.isRequired,
}
