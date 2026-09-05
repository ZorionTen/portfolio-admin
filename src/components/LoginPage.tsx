import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storeAdminKey, validatePasskey } from "@/lib/auth"

interface LoginPageProps {
  onLogin: (adminKey: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [passkey, setPasskey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!(await validatePasskey(passkey))) {
        setError("Invalid passkey")
        return
      }
      const key = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(passkey))
        .then((digest) =>
          Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
        )
      storeAdminKey(key)
      onLogin(key)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-head text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your numeric passkey to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="passkey">Passkey</Label>
              <Input
                id="passkey"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder="••••"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Checking…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}