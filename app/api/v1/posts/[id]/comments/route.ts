import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { comments, profiles, posts, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parseId } from "@/lib/api/response"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const postId = parseId((await context.params).id)
  if (!postId) return corsError(request, "INVALID_ID", "投稿IDが不正です。", 400)
  const rows = await db.select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, userId: comments.userId, name: user.name, handle: profiles.handle, avatarUrl: profiles.avatarUrl }).from(comments).innerJoin(user, eq(comments.userId, user.id)).leftJoin(profiles, eq(comments.userId, profiles.userId)).where(and(eq(comments.postId, postId), eq(user.status, "active"))).orderBy(desc(comments.createdAt))
  return corsJson(request, { items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), author: { id: row.userId, name: row.name, handle: row.handle, avatarUrl: row.avatarUrl } })) })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const postId = parseId((await context.params).id)
  if (!postId) return corsError(request, "INVALID_ID", "投稿IDが不正です。", 400)
  const exists = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1)
  if (!exists[0]) return corsError(request, "NOT_FOUND", "投稿が見つかりません。", 404)
  let body: unknown
  try { body = await request.json() } catch { return corsError(request, "INVALID_JSON", "JSON形式が不正です。", 400) }
  const text = typeof body === "object" && body !== null && "body" in body && typeof body.body === "string" ? body.body.trim() : ""
  if (!text || text.length > 2000) return corsError(request, "VALIDATION_ERROR", "コメントは1〜2000文字で入力してください。", 422)
  const [created] = await db.insert(comments).values({ postId, userId: auth.id, body: text }).returning({ id: comments.id, createdAt: comments.createdAt })
  return corsJson(request, { id: created.id, postId, body: text, createdAt: created.createdAt.toISOString() }, { status: 201 })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
