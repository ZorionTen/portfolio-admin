export interface SessionSummary {
  sessionId: string
  messageCount: number
  firstActivity: string
  lastActivity: string
  emails: string[]
}

export interface ContactIntent {
  id: string
  name: string | null
  companyName: string | null
  email: string | null
  sessionId: string | null
  createdAt: string
}

export interface Stats {
  mostRecentContact: ContactIntent | null
  totalContactIntents: number
  totalSessions: number
}

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL ?? "").replace(/\/$/, "")

async function adminFetch<T>(path: string, adminKey: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Admin-Key": adminKey },
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export function fetchSessions(adminKey: string): Promise<SessionSummary[]> {
  return adminFetch<SessionSummary[]>("/api/admin/sessions", adminKey)
}

export function fetchStats(adminKey: string): Promise<Stats> {
  return adminFetch<Stats>("/api/admin/stats", adminKey)
}