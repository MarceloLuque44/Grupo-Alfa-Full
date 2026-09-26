import PropTypes from "prop-types"

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>
}

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>
}

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
}

function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>
}

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
}

export default function Card({ children, onClick, label }) {
  if (onClick) {
    return (
      <button type="button" className="card" onClick={onClick} aria-label={label}>
        {children}
      </button>
    )
  }
  return <div className="card">{children}</div>
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  label: PropTypes.string,
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
