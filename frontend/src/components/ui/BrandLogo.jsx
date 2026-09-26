import PropTypes from "prop-types"
import logoUrl from "../../imagenes/grupoAlfa.jpg"

export default function BrandLogo({ size = 72, withName = false }) {
  return (
    <span className="brand-logo">
      <img
        src={logoUrl}
        alt="Grupo Alfa"
        width={size}
        height={size}
        loading="eager"
        decoding="sync"
      />
      {withName && <span className="brand-logo-name">Grupo Alfa</span>}
    </span>
  )
}

BrandLogo.propTypes = {
  size: PropTypes.number,
  withName: PropTypes.bool,
}
