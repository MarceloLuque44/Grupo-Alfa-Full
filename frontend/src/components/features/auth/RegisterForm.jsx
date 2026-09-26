import PropTypes from "prop-types"
import BrandLogo from "../../ui/BrandLogo"
import TextField from "../../ui/TextField"
import Button from "../../ui/Button"

const FIELDS = [
  { name: "nro_carnet", label: "Nro de carnet", type: "number", placeholder: "Ej. 1234567", min: "1", autoComplete: undefined },
  { name: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre", autoComplete: undefined },
  { name: "apellido_paterno", label: "Apellido paterno", type: "text", placeholder: "Apellido paterno", autoComplete: undefined },
  { name: "apellido_materno", label: "Apellido materno", type: "text", placeholder: "Apellido materno", autoComplete: undefined },
  { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", placeholder: undefined, autoComplete: undefined },
  { name: "correo_electronico", label: "Correo electrónico", type: "email", placeholder: "tu-correo@ejemplo.com", autoComplete: "email" },
  { name: "contraseña", label: "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres", autoComplete: "new-password" },
  { name: "confirmar", label: "Confirmar contraseña", type: "password", placeholder: "Repite tu contraseña", autoComplete: "new-password" },
]

export default function RegisterForm({ form, error, saving, onChange, onSubmit, onGoLogin }) {
  return (
    <section className="login-card">
      <BrandLogo size={72} />
      <p className="eyebrow">Grupo Alfa</p>
      <h1>Crear cuenta</h1>
      <p className="intro">Completa tus datos para registrarte.</p>

      <form onSubmit={onSubmit}>
        {FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`reg-${field.name}`}
            label={field.label}
            type={field.type}
            value={form[field.name]}
            onChange={(event) => onChange(field.name, event.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            autoComplete={field.autoComplete}
            required
          />
        ))}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Creando cuenta..." : "Registrarse"}
        </Button>
        <button className="link-button center" type="button" onClick={onGoLogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </section>
  )
}

RegisterForm.propTypes = {
  form: PropTypes.object.isRequired,
  error: PropTypes.string.isRequired,
  saving: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onGoLogin: PropTypes.func.isRequired,
}
