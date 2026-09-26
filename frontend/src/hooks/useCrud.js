import { useCallback, useEffect, useRef, useState } from "react"
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from "../services/academicService"

export function useCrud(entity, initialParams) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState(null)

  const initialRef = useRef(initialParams)

  const reload = useCallback(
    async (params = initialRef.current) => {
      if (!entity?.endpoint) return []
      setIsLoading(true)
      setError("")
      try {
        const rows = await listResource(entity.endpoint, params)
        setItems(Array.isArray(rows) ? rows : [])
        return rows
      } catch (err) {
        setError(err.userMessage ?? "No se pudo cargar la información.")
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [entity],
  )

  useEffect(() => {
    reload()
  }, [reload])

  const save = useCallback(
    async (payload) => {
      const pk = entity.pk
      if (selected?.[pk] != null) {
        return updateResource(entity.endpoint, selected[pk], payload)
      }
      return createResource(entity.endpoint, payload)
    },
    [entity, selected],
  )

  const remove = useCallback(
    async (id) => {
      await deleteResource(entity.endpoint, id)
      setItems((prev) => prev.filter((row) => row[entity.pk] !== id))
    },
    [entity],
  )

  return { items, isLoading, error, selected, setSelected, reload, save, remove }
}
