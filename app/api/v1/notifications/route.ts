import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { notifications, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, parsePositiveInt } from "@/lib/api/response"

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  const limit = parsePositiveInt(new URL(request.url).searchParams.get("limit"), 30, 50)
  const rows = await db.select({ id: notifications.id, type: notifications.type, postId: notifications.postId, read: notifications.read, createdAt: notifications.createdAt, actorId: notifications.actorId, actorName: user.name, handle: profiles.handle }).from(notifications).leftJoin(user, eq(notifications.actorId, user.id)).leftJoin(profiles, eq(notifications.actorId, profiles.userId)).where(eq(notifications.userId, auth.id)).orderBy(desc(notifications.createdAt)).limit(limit)
  return corsJson(request, { items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), actor: { id: row.actorId, name: row.actorName ?? "退会したユーザー", handle: row.handle ?? "unknown" } })) })
}

export async function PATCH(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "認証が必要です。", 401)
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.userId, auth.id), eq(notifications.read, false)))
  return corsJson(request, { updated: true })
}
export function OPTIONS() { return new Response(null, { status: 204 }) }
