"use server"

import { db } from "@/lib/db"
import { empathies, bookmarks, comments, posts, profiles, user } from "@/lib/db/schema"
import { ensureUserStatusColumn } from "@/lib/db/ensure-user-status"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"
import { formatRelative } from "@/lib/format"
import { createNotification, removeNotification } from "@/lib/actions/notifications"

// 投稿の作者IDを取得するヘルパー
async function getPostAuthorId(postId: number): Promise<string | null> {
  const rows = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).limit(1)
  return rows[0]?.userId ?? null
}

export type ToggleResult = { active: boolean; count: number }

export async function toggleEmpathy(postId: number): Promise<ToggleResult> {
  const userId = await getUserId()
  const existing = await db
    .select({ id: empathies.id })
    .from(empathies)
    .where(and(eq(empathies.postId, postId), eq(empathies.userId, userId)))
    .limit(1)

  const authorId = await getPostAuthorId(postId)
  if (existing.length > 0) {
    await db.delete(empathies).where(and(eq(empathies.postId, postId), eq(empathies.userId, userId)))
    if (authorId) await removeNotification({ recipientId: authorId, actorId: userId, type: "empathy", postId })
  } else {
    await db.insert(empathies).values({ postId, userId })
    if (authorId) await createNotification({ recipientId: authorId, actorId: userId, type: "empathy", postId })
  }

  const all = await db.select({ id: empathies.id }).from(empathies).where(eq(empathies.postId, postId))
  revalidatePath("/feed")
  return { active: existing.length === 0, count: all.length }
}

export async function toggleBookmark(postId: number): Promise<ToggleResult> {
  const userId = await getUserId()
  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, userId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(bookmarks).where(and(eq(bookmarks.postId, postId), eq(bookmarks.userId, userId)))
  } else {
    await db.insert(bookmarks).values({ postId, userId })
  }

  const all = await db.select({ id: bookmarks.id }).from(bookmarks).where(eq(bookmarks.postId, postId))
  revalidatePath("/feed")
  return { active: existing.length === 0, count: all.length }
}

export type CommentView = {
  id: number
  author: { name: string; handle: string }
  body: string
  createdAt: string
}

export async function getComments(postId: number): Promise<CommentView[]> {
  await ensureUserStatusColumn()
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      name: user.name,
      handle: profiles.handle,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .leftJoin(profiles, eq(comments.userId, profiles.userId))
    .where(and(eq(comments.postId, postId), eq(user.status, "active")))
    .orderBy(desc(comments.createdAt))

  return rows.map((r) => ({
    id: r.id,
    author: { name: r.name ?? "退会したユーザー", handle: r.handle ?? "unknown" },
    body: r.body,
    createdAt: formatRelative(r.createdAt),
  }))
}

export async function addComment(postId: number, body: string) {
  const userId = await getUserId()
  const trimmed = body.trim()
  if (!trimmed) return
  await db.insert(comments).values({ postId, userId, body: trimmed })
  const authorId = await getPostAuthorId(postId)
  if (authorId) await createNotification({ recipientId: authorId, actorId: userId, type: "comment", postId })
  revalidatePath("/feed")
}
