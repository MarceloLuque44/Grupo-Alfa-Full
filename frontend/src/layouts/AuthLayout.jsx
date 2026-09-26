import { Outlet } from "react-router-dom"
import "../App.css"

export default function AuthLayout() {
  return (
    <main className="login-page">
      <Outlet />
    </main>
  )
}
