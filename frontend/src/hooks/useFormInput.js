import { useCallback, useState } from "react"

export function useFormInput({ initialValue = "", validator = null } = {}) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(null)

  const validate = useCallback(() => {
    if (validator) {
      const validationError = validator(value)
      setError(validationError)
      return !validationError
    }
    return true
  }, [value, validator])

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(null)
  }, [initialValue])

  return {
    value,
    setValue,
    error,
    validate,
    reset,
    bind: {
      value,
      onChange: (event) => setValue(event.target.value),
    },
  }
}
