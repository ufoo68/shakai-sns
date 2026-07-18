"use server"

import { db } from "@/lib/db"
import { notifications, posts, profiles, user } from "@/lib/db/schema"
import { and, desc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, getOptionalUserId } from "@/lib/session"
import { formatRelative } from "@/lib/format"

export type NotificationType = "empathy" | "comment" | "follow"

// 通知を作成する。受信者=actor(自分自身)の場合は作らない。
export async function createNotification(input: {
  recipientId: string
  actorId: string
  type: NotificationType
  postId?: number
}) {
  if (input.recipientId === input.actorId) return
  await db.insert(notifications).values({
    userId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId ?? null,
  })
}

// 共感やブックマークを取り消したときに、対応する通知を消す(コメントは残す)
export async function removeNotification(input: {
  recipientId: string
  actorId: string
  type: NotificationType
  postId?: number
}) {
  if (input.recipientId === input.actorId) return
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.userId, input.recipientId),
        eq(notifications.actorId, input.actorId),
        eq(notifications.type, input.type),
        input.postId != null ? eq(notifications.postId, input.postId) : eq(notifications.type, input.type),
      ),
    )
}

export type NotificationView = {
  id: number
  type: NotificationType
  actor: { name: string; handle: string }
  postId: number | null
  postTitle: string | null
  read: boolean
  createdAt: string
}

export async function getNotifications(limit = 30): Promise<NotificationView[]> {
  const me = await getOptionalUserId()
  if (!me) return []

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      postId: notifications.postId,
      read: notifications.read,
      createdAt: notifications.createdAt,
      actorName: user.name,
      actorHandle: profiles.handle,
    })
    .from(notifications)
    .leftJoin(user, eq(notifications.actorId, user.id))
    .leftJoin(profiles, eq(notifications.actorId, profiles.userId))
    .where(eq(notifications.userId, me))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)

  // 投稿タイトルをまとめて引く
  const postIds = rows.map((r) => r.postId).filter((v): v is number => v != null)
  const titleMap = new Map<number, string>()
  if (postIds.length > 0) {
    const titles = await db
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(inArray(posts.id, postIds))
    for (const t of titles) titleMap.set(t.id, t.title)
  }

  return rows.map((r) => ({
    id: r.id,
    type: r.type as NotificationType,
    actor: { name: r.actorName ?? "退会したユーザー", handle: r.actorHandle ?? "unknown" },
    postId: r.postId,
    postTitle: r.postId != null ? (titleMap.get(r.postId) ?? null) : null,
    read: r.read,
    createdAt: formatRelative(r.createdAt),
  }))
}

export async function getUnreadCount(): Promise<number> {
  const me = await getOptionalUserId()
  if (!me) return 0
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, me), eq(notifications.read, false)))
  return rows.length
}

export async function markAllNotificationsRead() {
  const me = await getUserId()
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, me), eq(notifications.read, false)))
  revalidatePath("/feed")
}
