import { createContext, useCallback, useMemo, useState } from "react"
import PropTypes from "prop-types"

const TOKEN_KEY = "ga_token"
const USER_KEY = "ga_user"

export const AuthContext = createContext(null)

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [loggedUser, setLoggedUser] = useState(readUser)
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  })

  const signIn = useCallback((user, nextToken = null) => {
    setLoggedUser(user)
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      if (nextToken) {
        localStorage.setItem(TOKEN_KEY, nextToken)
        setToken(nextToken)
      }
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const signOut = useCallback(() => {
    setLoggedUser(null)
    setToken(null)
    try {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const value = useMemo(
    () => ({ loggedUser, token, signIn, signOut }),
    [loggedUser, token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
