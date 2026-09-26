import PropTypes from "prop-types"

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  onMouseEnter,
  onFocus,
  children,
}) {
  const className = [
    variant === "primary" ? "submit-button" : "secondary-button",
    size === "sm" ? "small" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onFocus: PropTypes.func,
  children: PropTypes.node.isRequired,
}
