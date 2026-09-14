import { and, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { posts, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson } from "@/lib/api/response"

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (!query) return corsJson(request, { posts: [], users: [] })
  const like = `%${query}%`
  const [postRows, userRows] = await Promise.all([
    db.select({ id: posts.id, userId: posts.userId, title: posts.title, body: posts.body, genre: posts.genre, division: posts.division, form: posts.form, createdAt: posts.createdAt, name: user.name, handle: profiles.handle, avatarUrl: profiles.avatarUrl }).from(posts).innerJoin(user, eq(posts.userId, user.id)).leftJoin(profiles, eq(posts.userId, profiles.userId)).where(and(or(ilike(posts.title, like), ilike(posts.body, like)), eq(user.status, "active"))).orderBy(desc(posts.createdAt)).limit(30),
    db.select({ userId: user.id, name: user.name, handle: profiles.handle, bio: profiles.bio, avatarUrl: profiles.avatarUrl }).from(user).innerJoin(profiles, eq(user.id, profiles.userId)).where(and(or(ilike(user.name, like), ilike(profiles.handle, like), ilike(profiles.bio, like)), eq(user.status, "active"))).limit(20),
  ])
  return corsJson(request, { posts: postRows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), author: { id: row.userId, name: row.name, handle: row.handle, avatarUrl: row.avatarUrl } })), users: userRows })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
