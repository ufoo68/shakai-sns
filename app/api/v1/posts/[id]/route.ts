import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { posts, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parseId } from "@/lib/api/response"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const id = parseId((await context.params).id)
  if (!id) return corsError(request, "INVALID_ID", "投稿IDが不正です。", 400)
  const rows = await db.select({ id: posts.id, userId: posts.userId, genre: posts.genre, division: posts.division, form: posts.form, title: posts.title, body: posts.body, createdAt: posts.createdAt, name: user.name, handle: profiles.handle, avatarUrl: profiles.avatarUrl }).from(posts).innerJoin(user, eq(posts.userId, user.id)).leftJoin(profiles, eq(posts.userId, profiles.userId)).where(and(eq(posts.id, id), eq(user.status, "active"))).limit(1)
  const row = rows[0]
  if (!row) return corsError(request, "NOT_FOUND", "投稿が見つかりません。", 404)
  return corsJson(request, { ...row, createdAt: row.createdAt.toISOString(), author: { id: row.userId, name: row.name, handle: row.handle, avatarUrl: row.avatarUrl } })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
