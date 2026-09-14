import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookmarks, posts } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parseId } from "@/lib/api/response"

async function toggle(request: Request, context: { params: Promise<{ id: string }> }, active: boolean) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const postId = parseId((await context.params).id)
  if (!postId) return corsError(request, "INVALID_ID", "投稿IDが不正です。", 400)
  const post = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1)
  if (!post[0]) return corsError(request, "NOT_FOUND", "投稿が見つかりません。", 404)
  const existing = await db.select({ id: bookmarks.id }).from(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, auth.id))).limit(1)
  if (active && !existing[0]) await db.insert(bookmarks).values({ postId, userId: auth.id })
  if (!active && existing[0]) await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id))
  return corsJson(request, { active })
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { return toggle(request, context, true) }
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { return toggle(request, context, false) }
export function OPTIONS() { return new Response(null, { status: 204 }) }
