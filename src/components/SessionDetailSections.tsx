import {
  Building2,
  CalendarDays,
  Mail,
  UserRound,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ContactIntent } from "@/lib/api"

const SKELETON_KEYS = ["messages", "first-activity", "last-activity", "session-id"] as const

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function displayValue(value: string | null): string {
  return value ?? "Not provided"
}

export function SessionDetailSkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKELETON_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-36" />
            </CardHeader>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-48" />
        </CardContent>
      </Card>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-7 w-44" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </section>
    </>
  )
}

export function ContactIntentCard({ intent }: { intent: ContactIntent }) {
  return (
    <Card size="sm">
      <CardHeader className="border-b-2">
        <CardTitle className="flex items-start gap-2 font-head text-lg">
          <UserRound className="mt-0.5 size-5 shrink-0 text-primary" />
          <span className="break-words">{displayValue(intent.name)}</span>
        </CardTitle>
        <CardDescription className="break-all font-mono text-xs">
          {intent.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-1">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-head text-xs font-medium text-muted-foreground">
              Company
            </p>
            <p className="break-words">{displayValue(intent.companyName)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-head text-xs font-medium text-muted-foreground">
              Email
            </p>
            {intent.email ? (
              <a
                className="break-all text-primary underline-offset-4 hover:underline"
                href={`mailto:${intent.email}`}
              >
                {intent.email}
              </a>
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-head text-xs font-medium text-muted-foreground">
              Created
            </p>
            <time dateTime={intent.createdAt}>{formatDate(intent.createdAt)}</time>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
