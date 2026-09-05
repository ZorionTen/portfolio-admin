const ADMIN_KEY_STORAGE = "portfolio-admin-key"

/** SHA-256 hex digest of a string, via Web Crypto. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Expected admin key hash from VITE_ADMIN_KEY (SHA-256 of the numeric passkey). */
export function expectedAdminKey(): string {
  return import.meta.env.VITE_ADMIN_KEY ?? ""
}

/** Validate a numeric passkey against the env-configured admin key hash. */
export async function validatePasskey(passkey: string): Promise<boolean> {
  const expected = expectedAdminKey()
  if (!expected) return false
  const actual = await sha256Hex(passkey)
  return actual === expected
}

export function getStoredAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

export function storeAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE)
}