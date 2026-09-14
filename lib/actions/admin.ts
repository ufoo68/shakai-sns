"use server"

import { db } from "@/lib/db"
import {
  account,
  bookmarks,
  books,
  comments,
  empathies,
  follows,
  inquiries,
  notifications,
  posts,
  profiles,
  reports,
  session,
  user,
} from "@/lib/db/schema"
import { desc, eq, inArray, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/session"
import { formatRelative } from "@/lib/format"
import type { AdminUserView, ReportView, InquiryView, AdminPostView } from "@/lib/data"

function excerptOf(body: string) {
  const oneLine = body.replace(/\s+/g, " ").trim()
  return oneLine.length > 100 ? oneLine.slice(0, 100) + "…" : oneLine
}

// --- ダッシュボード集計 -----------------------------------------------------

export async function getAdminStats() {
  await requireAdmin()
  const [[u], [p], [openReports], [openInquiries]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(user),
    db.select({ n: sql<number>`count(*)::int` }).from(posts),
    db.select({ n: sql<number>`count(*)::int` }).from(reports).where(eq(reports.status, "open")),
    db.select({ n: sql<number>`count(*)::int` }).from(inquiries).where(eq(inquiries.status, "open")),
  ])
  return {
    users: u?.n ?? 0,
    posts: p?.n ?? 0,
    openReports: openReports?.n ?? 0,
    openInquiries: openInquiries?.n ?? 0,
  }
}

// --- ユーザー一覧 -----------------------------------------------------------

export async function getAdminUsers(): Promise<AdminUserView[]> {
  const me = await requireAdmin()
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      handle: profiles.handle,
      postCount: sql<number>`(select count(*)::int from ${posts} where ${posts.userId} = ${user.id})`,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .orderBy(desc(user.createdAt))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    handle: r.handle ?? "unknown",
    role: r.role,
    status: r.status,
    postCount: r.postCount ?? 0,
    createdAt: formatRelative(r.createdAt),
    isMe: r.id === me,
  }))
}

// 管理者権限の付与/剥奪(自分自身は変更不可)
export async function setUserRole(userId: string, role: "user" | "admin") {
  const me = await requireAdmin()
  if (userId === me) throw new Error("自分自身の権限は変更できません。")
  await db.update(user).set({ role }).where(eq(user.id, userId))
  revalidatePath("/admin/users")
}

// ユーザー凍結/解除(自分自身は変更不可)。凍結時は既存セッションを失効させる。
export async function setUserStatus(userId: string, status: "active" | "frozen") {
  const me = await requireAdmin()
  if (userId === me) throw new Error("自分自身は凍結できません。")
  await db.transaction(async (tx) => {
    await tx.update(user).set({ status, updatedAt: new Date() }).where(eq(user.id, userId))
    if (status === "frozen") {
      await tx.delete(session).where(eq(session.userId, userId))
    }
  })
  revalidatePath("/")
  revalidatePath("/admin/users")
  revalidatePath("/feed")
  revalidatePath("/search")
}

// ユーザーを削除。投稿と反応・フォロー・通知などの手動関連データを整合的に掃除する。
export async function adminDeleteUser(userId: string) {
  const me = await requireAdmin()
  if (userId === me) throw new Error("自分自身は削除できません。")

  await db.transaction(async (tx) => {
    const ownedPosts = await tx.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId))
    const postIds = ownedPosts.map((p) => p.id)

    if (postIds.length > 0) {
      await tx.delete(empathies).where(inArray(empathies.postId, postIds))
      await tx.delete(comments).where(inArray(comments.postId, postIds))
      await tx.delete(bookmarks).where(inArray(bookmarks.postId, postIds))
      await tx.delete(reports).where(inArray(reports.postId, postIds))
      await tx.delete(notifications).where(inArray(notifications.postId, postIds))
      await tx.delete(posts).where(inArray(posts.id, postIds))
    }

    await tx.delete(empathies).where(eq(empathies.userId, userId))
    await tx.delete(comments).where(eq(comments.userId, userId))
    await tx.delete(bookmarks).where(eq(bookmarks.userId, userId))
    await tx.delete(follows).where(or(eq(follows.userId, userId), eq(follows.followingId, userId)))
    await tx.delete(notifications).where(or(eq(notifications.userId, userId), eq(notifications.actorId, userId)))
    await tx.delete(reports).where(eq(reports.reporterId, userId))
    await tx.update(inquiries).set({ userId: null }).where(eq(inquiries.userId, userId))
    await tx.delete(books).where(eq(books.userId, userId))
    await tx.delete(profiles).where(eq(profiles.userId, userId))
    await tx.delete(session).where(eq(session.userId, userId))
    await tx.delete(account).where(eq(account.userId, userId))
    await tx.delete(user).where(eq(user.id, userId))
  })

  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath("/admin/posts")
  revalidatePath("/admin/reports")
  revalidatePath("/feed")
  revalidatePath("/search")
}

// --- 通報一覧 ---------------------------------------------------------------

export async function getAdminReports(): Promise<ReportView[]> {
  await requireAdmin()
  const rows = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      detail: reports.detail,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: user.name,
      reporterHandle: profiles.handle,
      postId: posts.id,
      postTitle: posts.title,
      postBody: posts.body,
      authorId: posts.userId,
    })
    .from(reports)
    .leftJoin(user, eq(reports.reporterId, user.id))
    .leftJoin(profiles, eq(reports.reporterId, profiles.userId))
    .leftJoin(posts, eq(reports.postId, posts.id))
    .orderBy(desc(reports.createdAt))

  // 投稿作者の表示名・ハンドルを取得
  const authorIds = Array.from(new Set(rows.map((r) => r.authorId).filter((x): x is string => !!x)))
  const authors =
    authorIds.length > 0
      ? await db
          .select({ id: user.id, name: user.name, handle: profiles.handle })
          .from(user)
          .leftJoin(profiles, eq(profiles.userId, user.id))
          .where(inArray(user.id, authorIds))
      : []
  const authorMap = new Map(authors.map((a) => [a.id, a]))

  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    detail: r.detail,
    status: r.status,
    createdAt: formatRelative(r.createdAt),
    reporter: { name: r.reporterName ?? "不明", handle: r.reporterHandle ?? "unknown" },
    post: r.postId
      ? {
          id: r.postId,
          title: r.postTitle ?? "",
          excerpt: excerptOf(r.postBody ?? ""),
          author: {
            id: r.authorId ?? "",
            name: authorMap.get(r.authorId ?? "")?.name ?? "退会したユーザー",
            handle: authorMap.get(r.authorId ?? "")?.handle ?? "unknown",
          },
        }
      : null,
  }))
}

export async function updateReportStatus(id: number, status: "open" | "resolved" | "dismissed") {
  await requireAdmin()
  await db.update(reports).set({ status }).where(eq(reports.id, id))
  revalidatePath("/admin/reports")
}

// --- 問い合わせ一覧 ---------------------------------------------------------

export async function getAdminInquiries(): Promise<InquiryView[]> {
  await requireAdmin()
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt))
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    category: r.category,
    message: r.message,
    status: r.status,
    createdAt: formatRelative(r.createdAt),
  }))
}

export async function updateInquiryStatus(id: number, status: "open" | "resolved") {
  await requireAdmin()
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id))
  revalidatePath("/admin/inquiries")
}

// --- 投稿管理 ---------------------------------------------------------------

export async function getAdminPosts(): Promise<AdminPostView[]> {
  await requireAdmin()
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      body: posts.body,
      genre: posts.genre,
      createdAt: posts.createdAt,
      authorId: posts.userId,
      authorName: user.name,
      handle: profiles.handle,
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .orderBy(desc(posts.createdAt))

  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const [emp, com, rep] = await Promise.all([
    db.select({ postId: empathies.postId }).from(empathies).where(inArray(empathies.postId, ids)),
    db.select({ postId: comments.postId }).from(comments).where(inArray(comments.postId, ids)),
    db.select({ postId: reports.postId }).from(reports).where(inArray(reports.postId, ids)),
  ])
  const count = (arr: { postId: number }[]) => {
    const m = new Map<number, number>()
    for (const x of arr) m.set(x.postId, (m.get(x.postId) ?? 0) + 1)
    return m
  }
  const empC = count(emp)
  const comC = count(com)
  const repC = count(rep)

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    excerpt: excerptOf(r.body),
    genre: r.genre,
    createdAt: formatRelative(r.createdAt),
    author: { id: r.authorId, name: r.authorName ?? "退会したユーザー", handle: r.handle ?? "unknown" },
    empathy: empC.get(r.id) ?? 0,
    comments: comC.get(r.id) ?? 0,
    reportCount: repC.get(r.id) ?? 0,
  }))
}

// 投稿を削除(管理者は誰の投稿でも削除可)。関連データも掃除する。
export async function adminDeletePost(id: number) {
  await requireAdmin()
  await db.transaction(async (tx) => {
    await tx.delete(empathies).where(eq(empathies.postId, id))
    await tx.delete(comments).where(eq(comments.postId, id))
    await tx.delete(bookmarks).where(eq(bookmarks.postId, id))
    await tx.delete(reports).where(eq(reports.postId, id))
    await tx.delete(notifications).where(eq(notifications.postId, id))
    await tx.delete(posts).where(eq(posts.id, id))
  })
  revalidatePath("/admin/posts")
  revalidatePath("/admin/reports")
  revalidatePath("/feed")
}
