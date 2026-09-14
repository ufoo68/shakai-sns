import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, withApiCors } from "@/lib/api/response"
import { GENRES } from "@/lib/data"

export async function GET(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const rows = await db.select({ userId: profiles.userId, handle: profiles.handle, name: user.name, bio: profiles.bio, currentThought: profiles.currentThought, interests: profiles.interests, avatarUrl: profiles.avatarUrl }).from(profiles).innerJoin(user, eq(profiles.userId, user.id)).where(and(eq(profiles.userId, viewer.id), eq(user.status, "active"))).limit(1)
  if (!rows[0]) return corsError(request, "NOT_FOUND", "Profile not found", 404)
  return corsJson(request, { ...rows[0], isMe: true })
}

export async function PATCH(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  let body: unknown
  try { body = await request.json() } catch { return corsError(request, "INVALID_JSON", "Request body must be valid JSON", 400) }
  if (!body || typeof body !== "object") return corsError(request, "VALIDATION_ERROR", "Request body must be an object", 422)
  const input = body as Record<string, unknown>
  const bio = typeof input.bio === "string" ? input.bio.trim().slice(0, 400) : undefined
  const currentThought = typeof input.currentThought === "string" ? input.currentThought.trim().slice(0, 400) : undefined
  const interests = Array.isArray(input.interests) && input.interests.every((item) => typeof item === "string") ? input.interests.filter((item): item is string => GENRES.includes(item as (typeof GENRES)[number])) : undefined
  if (bio === undefined && currentThought === undefined && interests === undefined) return corsError(request, "VALIDATION_ERROR", "At least one profile field is required", 422)
  await db.update(profiles).set({ ...(bio === undefined ? {} : { bio }), ...(currentThought === undefined ? {} : { currentThought }), ...(interests === undefined ? {} : { interests }), updatedAt: new Date() }).where(eq(profiles.userId, viewer.id))
  return GET(request)
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
