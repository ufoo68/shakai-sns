import { and, desc, eq, ne } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, withApiCors, parsePositiveInt } from "@/lib/api/response"

export async function GET(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)
  const limit = parsePositiveInt(new URL(request.url).searchParams.get("limit"), 3, 20)
  const rows = await db.select({ userId: profiles.userId, handle: profiles.handle, name: user.name, interests: profiles.interests, avatarUrl: profiles.avatarUrl }).from(profiles).innerJoin(user, eq(profiles.userId, user.id)).where(and(ne(profiles.userId, viewer.id), eq(user.status, "active"))).orderBy(desc(profiles.createdAt)).limit(limit)
  return corsJson(request, rows)
}


export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
