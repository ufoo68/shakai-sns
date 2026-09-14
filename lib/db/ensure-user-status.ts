import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

let ensureUserStatusColumnPromise: Promise<void> | null = null

export function ensureUserStatusColumn() {
  ensureUserStatusColumnPromise ??= db
    .execute(sql`alter table "user" add column if not exists "status" text not null default 'active'`)
    .then(() => undefined)
  return ensureUserStatusColumnPromise
}
