import { useNavigate } from "react-router-dom"
import DashboardHome from "../../components/dashboard/DashboardHome"
import { ENTITIES } from "../../config/entities"

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <DashboardHome
      onNavigate={(key) => navigate(ENTITIES[key]?.path ?? "/app/dashboard")}
    />
  )
}
