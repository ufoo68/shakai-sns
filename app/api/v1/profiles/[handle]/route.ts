import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { follows, posts, profiles, user } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, withApiCors } from "@/lib/api/response"

async function getProfile(handle: string, viewerId?: string) {
  const rows = await db
    .select({
      userId: profiles.userId,
      handle: profiles.handle,
      name: user.name,
      bio: profiles.bio,
      currentThought: profiles.currentThought,
      interests: profiles.interests,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .innerJoin(user, eq(profiles.userId, user.id))
    .where(and(eq(profiles.handle, handle), eq(user.status, "active")))
    .limit(1)

  const profile = rows[0]
  if (!profile) return null

  const [postCount, followingCount, followerCount, follow] = await Promise.all([
    db.select({ id: posts.id }).from(posts).where(eq(posts.userId, profile.userId)),
    db.select({ id: follows.id }).from(follows).where(eq(follows.userId, profile.userId)),
    db.select({ id: follows.id }).from(follows).where(eq(follows.followingId, profile.userId)),
    viewerId && viewerId !== profile.userId
      ? db.select({ id: follows.id }).from(follows).where(and(eq(follows.userId, viewerId), eq(follows.followingId, profile.userId))).limit(1)
      : Promise.resolve([]),
  ])

  return {
    ...profile,
    isMe: viewerId === profile.userId,
    followedByMe: follow.length > 0,
    postCount: postCount.length,
    followingCount: followingCount.length,
    followerCount: followerCount.length,
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const viewer = await authenticateApiRequest(request)
  const { handle } = await params
  const profile = await getProfile(decodeURIComponent(handle), viewer?.id)
  if (!profile) return corsError(request, "NOT_FOUND", "Profile not found", 404)
  return corsJson(request, profile)
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
