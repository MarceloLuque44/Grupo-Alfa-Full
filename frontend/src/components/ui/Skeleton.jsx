import PropTypes from "prop-types"

export default function Skeleton({ lines = 4 }) {
  return (
    <div className="skeleton" aria-label="Cargando">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  )
}

Skeleton.propTypes = {
  lines: PropTypes.number,
}
