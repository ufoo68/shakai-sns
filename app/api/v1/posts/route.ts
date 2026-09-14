import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { comments, empathies, posts, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parsePositiveInt } from "@/lib/api/response"

const fields = { id: posts.id, userId: posts.userId, genre: posts.genre, division: posts.division, form: posts.form, title: posts.title, body: posts.body, createdAt: posts.createdAt, authorName: user.name, handle: profiles.handle, avatarUrl: profiles.avatarUrl }

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "有効なBearerトークンが必要です。", 401)
  const url = new URL(request.url)
  const limit = parsePositiveInt(url.searchParams.get("limit"), 20, 50)
  const offset = Number(url.searchParams.get("offset") ?? 0)
  const rows = await db.select(fields).from(posts).innerJoin(user, eq(posts.userId, user.id)).leftJoin(profiles, eq(posts.userId, profiles.userId)).where(eq(user.status, "active")).orderBy(desc(posts.createdAt)).limit(limit).offset(Number.isInteger(offset) && offset >= 0 ? offset : 0)
  const ids = rows.map((row) => row.id)
  const [empathyRows, commentRows] = ids.length ? await Promise.all([
    db.select({ postId: empathies.postId, userId: empathies.userId }).from(empathies).where(inArray(empathies.postId, ids)),
    db.select({ postId: comments.postId }).from(comments).where(inArray(comments.postId, ids)),
  ]) : [[], []]
  const data = rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), author: { id: row.userId, name: row.authorName, handle: row.handle, avatarUrl: row.avatarUrl }, empathyCount: empathyRows.filter((item) => item.postId === row.id).length, commentCount: commentRows.filter((item) => item.postId === row.id).length, empathizedByMe: empathyRows.some((item) => item.postId === row.id && item.userId === auth.id) }))
  return corsJson(request, { items: data, pagination: { limit, offset: Number(offset) || 0, hasMore: rows.length === limit } })
}

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "有効なBearerトークンが必要です。", 401)
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return corsError(request, "INVALID_JSON", "JSON形式が不正です。", 400) }
  const values = ["genre", "division", "form", "title", "body"] as const
  if (values.some((key) => typeof body[key] !== "string" || !(body[key] as string).trim())) return corsError(request, "VALIDATION_ERROR", "genre、division、form、title、bodyは必須です。", 422)
  const [created] = await db.insert(posts).values({ userId: auth.id, genre: body.genre as string, division: body.division as string, form: body.form as string, title: (body.title as string).trim(), body: (body.body as string).trim() }).returning({ id: posts.id })
  return corsJson(request, { id: created.id }, { status: 201 })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
