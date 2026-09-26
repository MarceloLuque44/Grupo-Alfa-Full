import { useState } from "react"
import PropTypes from "prop-types"
import RegisterForm from "./RegisterForm"
import { registerUsuario } from "../../../services/usersService"

const initialForm = {
  nro_carnet: "",
  apellido_paterno: "",
  apellido_materno: "",
  nombre: "",
  fecha_nacimiento: "",
  correo_electronico: "",
  contraseña: "",
  confirmar: "",
}

export default function RegisterScreen({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!/^\S+@\S+\.\S+$/.test(form.correo_electronico.trim())) {
      setError("Debe ingresar un correo electrónico válido.")
      return
    }
    if (form.contraseña.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (form.contraseña !== form.confirmar) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (Number.isNaN(new Date(form.fecha_nacimiento).getTime())) {
      setError("La fecha de nacimiento debe ser una fecha válida.")
      return
    }

    setSaving(true)
    try {
      const { user, token } = await registerUsuario({
        nro_carnet: Number(form.nro_carnet),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim(),
        nombre: form.nombre.trim(),
        fecha_nacimiento: form.fecha_nacimiento,
        correo_electronico: form.correo_electronico.trim(),
        contraseña: form.contraseña,
      })
      onRegistered(user, token)
    } catch (err) {
      setError(err.userMessage ?? "No se pudo crear la cuenta.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RegisterForm
      form={form}
      error={error}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onGoLogin={onGoLogin}
    />
  )
}

RegisterScreen.propTypes = {
  onRegistered: PropTypes.func.isRequired,
  onGoLogin: PropTypes.func.isRequired,
}
