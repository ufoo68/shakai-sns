import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { posts, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parsePositiveInt } from "@/lib/api/response"

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "有効なBearerトークンが必要です。", 401)
  const url = new URL(request.url)
  const limit = parsePositiveInt(url.searchParams.get("limit"), 20, 50)
  const offsetValue = Number(url.searchParams.get("offset") ?? 0)
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0
  const rows = await db.select({ id: posts.id, userId: posts.userId, genre: posts.genre, division: posts.division, form: posts.form, title: posts.title, body: posts.body, createdAt: posts.createdAt, author: user.name, handle: profiles.handle, avatarUrl: profiles.avatarUrl }).from(posts).innerJoin(user, eq(posts.userId, user.id)).leftJoin(profiles, eq(posts.userId, profiles.userId)).where(eq(user.status, "active")).orderBy(desc(posts.createdAt)).limit(limit).offset(offset)
  return corsJson(request, { items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), author: { id: row.userId, name: row.author, handle: row.handle, avatarUrl: row.avatarUrl } })), pagination: { limit, offset, hasMore: rows.length === limit } })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
