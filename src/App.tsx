import { useState } from "react"
import { Dashboard } from "@/components/Dashboard"
import { LoginPage } from "@/components/LoginPage"
import { getStoredAdminKey } from "@/lib/auth"

function App() {
  const [adminKey, setAdminKey] = useState<string | null>(getStoredAdminKey)

  if (!adminKey) {
    return <LoginPage onLogin={setAdminKey} />
  }

  return <Dashboard adminKey={adminKey} onLogout={() => setAdminKey(null)} />
}

export default App