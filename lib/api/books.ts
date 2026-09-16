import { BOOK_STATUSES } from "@/lib/data"

export function parseBookInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 200) : ""
  const author = typeof input.author === "string" ? input.author.trim().slice(0, 200) : "著者不明"
  const translator = typeof input.translator === "string" ? input.translator.trim().slice(0, 200) : ""
  const status = typeof input.status === "string" && BOOK_STATUSES.includes(input.status as (typeof BOOK_STATUSES)[number]) ? input.status : null
  const note = input.note === undefined || input.note === null ? null : typeof input.note === "string" ? input.note.trim().slice(0, 2000) : null
  if (!title || !status) return null
  return { title, author: author || "著者不明", translator, status, note }
}
