import { useState } from "react"
import { Dashboard } from "@/components/Dashboard"
import { LoginPage } from "@/components/LoginPage"
import { SessionDetail } from "@/components/SessionDetail"
import { clearAdminKey, getStoredAdminKey } from "@/lib/auth"

function App() {
  const [adminKey, setAdminKey] = useState<string | null>(getStoredAdminKey)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  function handleLogout() {
    clearAdminKey()
    setAdminKey(null)
    setSelectedSessionId(null)
  }

  if (!adminKey) {
    return <LoginPage onLogin={setAdminKey} />
  }

  if (selectedSessionId) {
    return (
      <SessionDetail
        adminKey={adminKey}
        sessionId={selectedSessionId}
        onBack={() => setSelectedSessionId(null)}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <Dashboard
      adminKey={adminKey}
      onLogout={handleLogout}
      onSelectSession={setSelectedSessionId}
    />
  )
}

export default App
