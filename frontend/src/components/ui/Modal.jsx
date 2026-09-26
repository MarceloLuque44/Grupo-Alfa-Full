import PropTypes from "prop-types"

function ModalHeader({ children }) {
  return <div className="modal-header">{children}</div>
}

ModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
}

function ModalBody({ children }) {
  return <div className="modal-body">{children}</div>
}

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
}

function ModalFooter({ children }) {
  return <div className="modal-actions">{children}</div>
}

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
}

export default function Modal({ title, hint, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {(title || hint) && (
          <ModalHeader>
            {title && <h3>{title}</h3>}
            {hint && <p className="muted">{hint}</p>}
          </ModalHeader>
        )}
        {children}
      </div>
    </div>
  )
}

Modal.propTypes = {
  title: PropTypes.string,
  hint: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
