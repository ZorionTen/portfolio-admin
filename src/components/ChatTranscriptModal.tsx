import { useEffect, useRef, type MouseEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import type { ChatMessage } from "@/lib/api"

interface ChatTranscriptModalProps {
  open: boolean
  messages: readonly ChatMessage[]
  onClose: () => void
}

const messageStyles = {
  user: {
    wrapper: "flex justify-end",
    bubble: "border-primary-foreground/40 bg-primary text-primary-foreground shadow-md",
    label: "You",
    source: "border-primary-foreground/60 text-primary-foreground",
  },
  assistant: {
    wrapper: "flex justify-start",
    bubble: "border-border bg-muted text-foreground shadow-sm",
    label: "Assistant",
    source: "border-border text-foreground",
  },
} as const satisfies Record<
  ChatMessage["role"],
  {
    wrapper: string
    bubble: string
    label: string
    source: string
  }
>

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function ChatTranscriptModal({
  open,
  messages,
  onClose,
}: ChatTranscriptModalProps) {
  const modalRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    modalRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key !== "Tab") return
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === modal)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [onClose, open])

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-transcript-title"
        tabIndex={-1}
        className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded border-2 border-border bg-card text-card-foreground shadow-xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b-2 p-4">
          <div>
            <CardTitle id="chat-transcript-title" className="font-head text-xl">
              Chat transcript
            </CardTitle>
            <CardDescription>Full message history for this session.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            aria-label="Close chat transcript"
            title="Close chat transcript"
          >
            <X />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
              No messages in this session.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const style = messageStyles[message.role]
                return (
                  <article key={message.id} className={style.wrapper}>
                    <div className={`max-w-2xl border-2 p-3 ${style.bubble}`}>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span className="font-head text-xs font-semibold uppercase tracking-wide">
                          {style.label}
                        </span>
                        <time
                          dateTime={message.createdAt}
                          className="font-mono text-xs opacity-80"
                        >
                          {formatDate(message.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t-2 border-current/20 pt-2">
                          {message.sources.map((source, index) => (
                            <Badge
                              key={`${message.id}-${source}-${index}`}
                              variant="outline"
                              className={style.source}
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
