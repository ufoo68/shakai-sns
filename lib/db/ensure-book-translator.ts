import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

let ensureBookTranslatorColumnPromise: Promise<void> | null = null

export function ensureBookTranslatorColumn() {
  ensureBookTranslatorColumnPromise ??= db
    .execute(sql`alter table "books" add column if not exists "translator" text not null default ''`)
    .then(() => undefined)
  return ensureBookTranslatorColumnPromise
}
