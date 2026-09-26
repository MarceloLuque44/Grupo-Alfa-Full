import PropTypes from "prop-types"

export default function ErrorFallback({ message, onRetry }) {
  return (
    <div className="error-panel" role="alert">
      <p>{message || "Ocurrió un error al cargar."}</p>
      {onRetry && (
        <button className="secondary-button" type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

ErrorFallback.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
}
