import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, MessageSquare, UserRound } from "lucide-react"
import { ChatTranscriptModal } from "@/components/ChatTranscriptModal"
import {
  ContactIntentCard,
  SessionDetailSkeleton,
} from "@/components/SessionDetailSections"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  fetchContactIntentsBySession,
  fetchSessionDetail,
  type ContactIntent,
  type SessionDetail as SessionDetailData,
} from "@/lib/api"

interface SessionDetailProps {
  adminKey: string
  sessionId: string
  onBack: () => void
  onLogout: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function SessionDetail({
  adminKey,
  sessionId,
  onBack,
  onLogout,
}: SessionDetailProps) {
  const [session, setSession] = useState<SessionDetailData | null>(null)
  const [contactIntents, setContactIntents] = useState<ContactIntent[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [sessionData, intentData] = await Promise.all([
          fetchSessionDetail(adminKey, sessionId),
          fetchContactIntentsBySession(adminKey, sessionId),
        ])
        if (!cancelled) {
          setSession(sessionData)
          setContactIntents(intentData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load session")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [adminKey, sessionId])

  const closeTranscript = useCallback(() => {
    setTranscriptOpen(false)
  }, [])

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b-2 bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="font-head text-2xl">Portfolio Admin</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-start gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft />
              Back to sessions
            </Button>
            <div>
              <p className="font-head text-sm font-medium uppercase tracking-[0.12em] text-primary">
                Session detail
              </p>
              <h2 className="font-head text-3xl">Conversation record</h2>
              <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
                {sessionId}
              </p>
            </div>
          </div>
          {session && (
            <Button size="lg" onClick={() => setTranscriptOpen(true)}>
              <MessageSquare />
              Show chat transcript
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="font-head text-xl">Unable to load session</CardTitle>
              <CardDescription>
                The session data could not be retrieved from the admin API.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-destructive">{error}</CardContent>
          </Card>
        )}

        {session === null && error === null ? (
          <SessionDetailSkeleton />
        ) : (
          session && (
            <>
              <section aria-labelledby="session-metadata-heading" className="flex flex-col gap-4">
                <div>
                  <h3 id="session-metadata-heading" className="font-head text-xl">
                    Session metadata
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Activity and identity signals captured for this conversation.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader>
                      <CardDescription>Messages</CardDescription>
                      <CardTitle className="font-head text-3xl">
                        {session.messageCount}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardDescription>First activity</CardDescription>
                      <CardTitle className="font-head text-base">
                        {formatDate(session.firstActivity)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardDescription>Last activity</CardDescription>
                      <CardTitle className="font-head text-base">
                        {formatDate(session.lastActivity)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardDescription>Session ID</CardDescription>
                      <CardTitle className="break-all font-mono text-sm">
                        {session.sessionId}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </section>

              <Card>
                <CardHeader>
                  <CardTitle className="font-head text-xl">Linked emails</CardTitle>
                  <CardDescription>
                    Email addresses found in this session&apos;s messages.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {session.emails.length === 0 ? (
                    <p className="text-muted-foreground">No email addresses linked.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {session.emails.map((email) => (
                        <Badge key={email} variant="secondary">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <section aria-labelledby="contact-intents-heading" className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 id="contact-intents-heading" className="font-head text-xl">
                      Contact intents
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Contact details captured from this conversation.
                    </p>
                  </div>
                  {contactIntents && (
                    <Badge variant="outline">{contactIntents.length} found</Badge>
                  )}
                </div>
                {contactIntents?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                      <UserRound className="size-8 text-muted-foreground" />
                      <p className="font-head font-medium">No contact intents yet</p>
                      <p className="text-sm text-muted-foreground">
                        This session does not contain a captured contact request.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {contactIntents?.map((intent) => (
                      <ContactIntentCard key={intent.id} intent={intent} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )
        )}
      </main>

      {session && (
        <ChatTranscriptModal
          open={transcriptOpen}
          messages={session.messages}
          onClose={closeTranscript}
        />
      )}
    </div>
  )
}
