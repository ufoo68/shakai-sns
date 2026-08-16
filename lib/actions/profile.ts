"use server"

import { db } from "@/lib/db"
import { profiles, posts, follows, user } from "@/lib/db/schema"
import { and, desc, eq, ne, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, getOptionalUserId } from "@/lib/session"
import { GENRES, type ProfileView } from "@/lib/data"
import { createNotification, removeNotification } from "@/lib/actions/notifications"

async function counts(userId: string) {
  const [postRows, followingRows, followerRows] = await Promise.all([
    db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId)),
    db.select({ id: follows.id }).from(follows).where(eq(follows.userId, userId)),
    db.select({ id: follows.id }).from(follows).where(eq(follows.followingId, userId)),
  ])
  return {
    postCount: postRows.length,
    followingCount: followingRows.length,
    followerCount: followerRows.length,
  }
}

export async function getProfileByHandle(handle: string): Promise<ProfileView | null> {
  const rows = await db
    .select({
      userId: profiles.userId,
      handle: profiles.handle,
      bio: profiles.bio,
      currentThought: profiles.currentThought,
      interests: profiles.interests,
      avatarUrl: profiles.avatarUrl,
      name: user.name,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(eq(profiles.handle, handle))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return buildProfileView(row)
}

export async function getMyProfile(): Promise<ProfileView | null> {
  const me = await getOptionalUserId()
  if (!me) return null
  const rows = await db
    .select({
      userId: profiles.userId,
      handle: profiles.handle,
      bio: profiles.bio,
      currentThought: profiles.currentThought,
      interests: profiles.interests,
      avatarUrl: profiles.avatarUrl,
      name: user.name,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(eq(profiles.userId, me))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return buildProfileView(row)
}

async function buildProfileView(row: {
  userId: string
  handle: string
  bio: string
  currentThought: string
  interests: string[]
  avatarUrl: string | null
  name: string | null
}): Promise<ProfileView> {
  const me = await getOptionalUserId()
  const c = await counts(row.userId)
  let followedByMe = false
  if (me && me !== row.userId) {
    const f = await db
      .select({ id: follows.id })
      .from(follows)
      .where(and(eq(follows.userId, me), eq(follows.followingId, row.userId)))
      .limit(1)
    followedByMe = f.length > 0
  }
  return {
    userId: row.userId,
    name: row.name ?? "退会したユーザー",
    handle: row.handle,
    bio: row.bio,
    currentThought: row.currentThought,
    interests: row.interests,
    avatarUrl: row.avatarUrl,
    isMe: me === row.userId,
    followedByMe,
    ...c,
  }
}

export async function updateProfile(input: {
  bio: string
  currentThought: string
  interests: string[]
}) {
  const userId = await getUserId()
  const interests = input.interests.filter((i) => GENRES.includes(i as (typeof GENRES)[number]))
  await db
    .update(profiles)
    .set({
      bio: input.bio.trim().slice(0, 400),
      currentThought: input.currentThought.trim().slice(0, 400),
      interests,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId))
  revalidatePath("/profile")
}

// アップロード済みアバターのURLを自分のプロフィールに保存する
export async function updateAvatar(url: string) {
  const userId = await getUserId()
  // 想定外の値を弾く（アップロードAPIが返すBlobのhttps URLのみ許可）
  if (!/^https:\/\/.+/.test(url)) throw new Error("Invalid avatar URL")
  await db.update(profiles).set({ avatarUrl: url, updatedAt: new Date() }).where(eq(profiles.userId, userId))
  revalidatePath("/profile")
}

export async function toggleFollow(targetUserId: string) {
  const userId = await getUserId()
  if (userId === targetUserId) return
  const existing = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.userId, userId), eq(follows.followingId, targetUserId)))
    .limit(1)
  if (existing.length > 0) {
    await db.delete(follows).where(and(eq(follows.userId, userId), eq(follows.followingId, targetUserId)))
    await removeNotification({ recipientId: targetUserId, actorId: userId, type: "follow" })
  } else {
    await db.insert(follows).values({ userId, followingId: targetUserId })
    await createNotification({ recipientId: targetUserId, actorId: userId, type: "follow" })
  }
  revalidatePath("/feed")
  revalidatePath("/profile")
}

export type SuggestedUser = {
  userId: string
  name: string
  handle: string
  interests: string[]
  avatarUrl: string | null
  followedByMe: boolean
}

export async function getSuggestedUsers(limit = 3): Promise<SuggestedUser[]> {
  const me = await getOptionalUserId()
  const rows = await db
    .select({
      userId: profiles.userId,
      handle: profiles.handle,
      interests: profiles.interests,
      avatarUrl: profiles.avatarUrl,
      name: user.name,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(me ? ne(profiles.userId, me) : sql`true`)
    .orderBy(desc(profiles.createdAt))
    .limit(limit)

  let myFollows = new Set<string>()
  if (me) {
    const f = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.userId, me))
    myFollows = new Set(f.map((x) => x.followingId))
  }

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name ?? "退会したユーザー",
    handle: r.handle,
    interests: r.interests,
    followedByMe: myFollows.has(r.userId),
  }))
}
