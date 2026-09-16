import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { ensureBookTranslatorColumn } from "@/lib/db/ensure-book-translator"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parseId, withApiCors } from "@/lib/api/response"
import { parseBookInput } from "@/lib/api/books"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const id = parseId((await context.params).id)
  if (!id) return corsError(request, "INVALID_ID", "Book ID is invalid", 400)
  let body: unknown
  try { body = await request.json() } catch { return corsError(request, "INVALID_JSON", "Request body must be valid JSON", 400) }
  const input = parseBookInput(body)
  if (!input) return corsError(request, "VALIDATION_ERROR", "title and a valid status are required", 422)
  await ensureBookTranslatorColumn()
  const [updated] = await db.update(books).set(input).where(and(eq(books.id, id), eq(books.userId, viewer.id))).returning()
  if (!updated) return corsError(request, "NOT_FOUND", "Book not found", 404)
  return corsJson(request, updated)
}

export async function DELETE(request: Request, context: Context) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const id = parseId((await context.params).id)
  if (!id) return corsError(request, "INVALID_ID", "Book ID is invalid", 400)
  const [deleted] = await db.delete(books).where(and(eq(books.id, id), eq(books.userId, viewer.id))).returning({ id: books.id })
  if (!deleted) return corsError(request, "NOT_FOUND", "Book not found", 404)
  return corsJson(request, { deleted: true, id: deleted.id })
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
