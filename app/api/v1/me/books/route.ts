import { and, desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { ensureBookTranslatorColumn } from "@/lib/db/ensure-book-translator"
import { BOOK_STATUSES } from "@/lib/data"
import { parseBookInput } from "@/lib/api/books"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parsePositiveInt, withApiCors } from "@/lib/api/response"


export async function GET(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  await ensureBookTranslatorColumn()
  const url = new URL(request.url)
  const limit = parsePositiveInt(url.searchParams.get("limit"), 20, 50)
  const offsetValue = Number(url.searchParams.get("offset") ?? "0")
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0
  const status = url.searchParams.get("status")
  if (status && !BOOK_STATUSES.includes(status as (typeof BOOK_STATUSES)[number])) return corsError(request, "INVALID_STATUS", "Unknown book status", 422)
  const rows = await db.select().from(books).where(and(eq(books.userId, viewer.id), ...(status ? [eq(books.status, status)] : []))).orderBy(desc(books.createdAt)).limit(limit).offset(offset)
  return corsJson(request, { items: rows, limit, offset, hasMore: rows.length === limit })
}

export async function POST(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  let body: unknown
  try { body = await request.json() } catch { return corsError(request, "INVALID_JSON", "Request body must be valid JSON", 400) }
  const input = parseBookInput(body)
  if (!input) return corsError(request, "VALIDATION_ERROR", "title and a valid status are required", 422)
  await ensureBookTranslatorColumn()
  const [created] = await db.insert(books).values({ userId: viewer.id, ...input }).returning()
  return corsJson(request, created, { status: 201 })
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}

