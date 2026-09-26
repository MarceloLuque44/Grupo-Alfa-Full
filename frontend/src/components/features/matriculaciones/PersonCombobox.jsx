import { useMemo, useState } from "react"
import PropTypes from "prop-types"

// Combobox: input de texto con sugerencias filtradas mientras se escribe.
// Seleccionar una sugerencia fija el id; escribir libremente lo limpia.
export default function PersonCombobox({
  id,
  label,
  options,
  value,
  onSelect,
  placeholder,
  hint,
}) {
  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value],
  )
  const [text, setText] = useState(selected?.label ?? "")
  const [open, setOpen] = useState(false)

  const matches = useMemo(() => {
    const term = text.trim().toLowerCase()
    if (!term) return []
    return options
      .filter((o) => o.label.toLowerCase().includes(term) && String(o.value) !== String(value))
      .slice(0, 8)
  }, [text, options, value])

  const choose = (opt) => {
    setText(opt.label)
    setOpen(false)
    onSelect(opt.value)
  }

  const handleChange = (event) => {
    setText(event.target.value)
    setOpen(true)
    if (value != null) onSelect(null)
  }

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <div className="combobox-wrap">
        <input
          id={id}
          type="text"
          value={text}
          placeholder={placeholder ?? "Escribe para buscar..."}
          autoComplete="off"
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
        {open && matches.length > 0 && (
          <div className="combobox-list" role="listbox" aria-label={`Sugerencias de ${label}`}>
            {matches.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected="false"
                className="combobox-option"
                onMouseDown={(event) => {
                  event.preventDefault()
                  choose(opt)
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {selected ? (
        <p className="muted" style={{ margin: "4px 0 0" }}>Seleccionado: {selected.label}</p>
      ) : (
        hint && <p className="muted" style={{ margin: "4px 0 0" }}>{hint}</p>
      )}
    </div>
  )
}

PersonCombobox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, label: PropTypes.string.isRequired }),
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  hint: PropTypes.string,
}
