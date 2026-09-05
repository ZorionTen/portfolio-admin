import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchSessions, fetchStats, type SessionSummary, type Stats } from "@/lib/api"
import { clearAdminKey } from "@/lib/auth"
import { ThemeToggle } from "@/components/ThemeToggle"

interface DashboardProps {
  adminKey: string
  onLogout: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function shortId(id: string): string {
  return id.slice(0, 8)
}

export function Dashboard({ adminKey, onLogout }: DashboardProps) {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [sessionData, statsData] = await Promise.all([
          fetchSessions(adminKey),
          fetchStats(adminKey),
        ])
        if (!cancelled) {
          setSessions(sessionData)
          setStats(statsData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data")
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [adminKey])

  function handleLogout() {
    clearAdminKey()
    onLogout()
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b-2 bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="font-head text-2xl">Portfolio Admin</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        {error && (
          <Card className="border-destructive">
            <CardContent className="text-destructive">{error}</CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total sessions</CardDescription>
              <CardTitle className="font-head text-4xl">
                {stats ? stats.totalSessions : <Skeleton className="h-9 w-16" />}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Contact intents</CardDescription>
              <CardTitle className="font-head text-4xl">
                {stats ? (
                  stats.totalContactIntents
                ) : (
                  <Skeleton className="h-9 w-16" />
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Most recent contact</CardDescription>
              <CardTitle className="font-head text-lg">
                {stats ? (
                  stats.mostRecentContact?.email ?? "—"
                ) : (
                  <Skeleton className="h-7 w-32" />
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="font-head text-xl">Sessions</CardTitle>
            <CardDescription>
              Chat sessions with message counts and linked emails.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions === null ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>First activity</TableHead>
                    <TableHead>Last activity</TableHead>
                    <TableHead>Emails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.sessionId}>
                      <TableCell className="font-mono text-xs">
                        {shortId(session.sessionId)}
                      </TableCell>
                      <TableCell>{session.messageCount}</TableCell>
                      <TableCell>{formatDate(session.firstActivity)}</TableCell>
                      <TableCell>{formatDate(session.lastActivity)}</TableCell>
                      <TableCell>
                        {session.emails.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {session.emails.map((email) => (
                              <Badge key={email} variant="secondary">
                                {email}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}