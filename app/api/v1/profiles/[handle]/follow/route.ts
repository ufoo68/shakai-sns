import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { follows, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, withApiCors } from "@/lib/api/response"

async function targetId(handle: string) {
  const rows = await db.select({ userId: profiles.userId }).from(profiles).innerJoin(user, eq(profiles.userId, user.id)).where(and(eq(profiles.handle, handle), eq(user.status, "active"))).limit(1)
  return rows[0]?.userId ?? null
}

export async function POST(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const target = await targetId(decodeURIComponent((await params).handle))
  if (!target) return corsError(request, "NOT_FOUND", "Profile not found", 404)
  if (target === viewer.id) return corsError(request, "INVALID_OPERATION", "You cannot follow yourself", 422)
  const existing = await db.select({ id: follows.id }).from(follows).where(and(eq(follows.userId, viewer.id), eq(follows.followingId, target))).limit(1)
  if (existing.length === 0) await db.insert(follows).values({ userId: viewer.id, followingId: target })
  return corsJson(request, { following: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const target = await targetId(decodeURIComponent((await params).handle))
  if (!target) return corsError(request, "NOT_FOUND", "Profile not found", 404)
  await db.delete(follows).where(and(eq(follows.userId, viewer.id), eq(follows.followingId, target)))
  return corsJson(request, { following: false })
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
