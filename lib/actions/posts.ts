"use server"

import { db } from "@/lib/db"
import { posts, empathies, comments, bookmarks, profiles, user } from "@/lib/db/schema"
import { and, desc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, getOptionalUserId } from "@/lib/session"
import { formatRelative } from "@/lib/format"
import { DIVISIONS, FORMS, GENRES, type PostView } from "@/lib/data"

function excerptOf(body: string) {
  const oneLine = body.replace(/\s+/g, " ").trim()
  return oneLine.length > 120 ? oneLine.slice(0, 120) + "…" : oneLine
}

// 投稿行の配列を PostView[] に整形する(集計と自分の反応状態をまとめて取得)
async function toPostViews(
  rows: {
    id: number
    userId: string
    genre: string
    division: string
    form: string
    title: string
    body: string
    createdAt: Date
    authorName: string | null
    handle: string | null
  }[],
): Promise<PostView[]> {
  if (rows.length === 0) return []
  const me = await getOptionalUserId()
  const ids = rows.map((r) => r.id)

  const [emp, com, bmk] = await Promise.all([
    db.select({ postId: empathies.postId, userId: empathies.userId }).from(empathies).where(inArray(empathies.postId, ids)),
    db.select({ postId: comments.postId }).from(comments).where(inArray(comments.postId, ids)),
    db.select({ postId: bookmarks.postId, userId: bookmarks.userId }).from(bookmarks).where(inArray(bookmarks.postId, ids)),
  ])

  const empCount = new Map<number, number>()
  const empMine = new Set<number>()
  for (const e of emp) {
    empCount.set(e.postId, (empCount.get(e.postId) ?? 0) + 1)
    if (me && e.userId === me) empMine.add(e.postId)
  }
  const comCount = new Map<number, number>()
  for (const c of com) comCount.set(c.postId, (comCount.get(c.postId) ?? 0) + 1)

  const bmkCount = new Map<number, number>()
  const bmkMine = new Set<number>()
  for (const b of bmk) {
    bmkCount.set(b.postId, (bmkCount.get(b.postId) ?? 0) + 1)
    if (me && b.userId === me) bmkMine.add(b.postId)
  }

  return rows.map((r) => ({
    id: r.id,
    author: {
      id: r.userId,
      name: r.authorName ?? "退会したユーザー",
      handle: r.handle ?? "unknown",
    },
    createdAt: formatRelative(r.createdAt),
    genre: r.genre,
    division: r.division,
    form: r.form,
    title: r.title,
    body: r.body,
    excerpt: excerptOf(r.body),
    empathy: empCount.get(r.id) ?? 0,
    comments: comCount.get(r.id) ?? 0,
    bookmarks: bmkCount.get(r.id) ?? 0,
    empathizedByMe: empMine.has(r.id),
    bookmarkedByMe: bmkMine.has(r.id),
  }))
}

const baseSelect = {
  id: posts.id,
  userId: posts.userId,
  genre: posts.genre,
  division: posts.division,
  form: posts.form,
  title: posts.title,
  body: posts.body,
  createdAt: posts.createdAt,
  authorName: user.name,
  handle: profiles.handle,
}

export async function getFeedPosts(limit = 50): Promise<PostView[]> {
  const rows = await db
    .select(baseSelect)
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
  return toPostViews(rows)
}

export async function getPostsByUser(userId: string): Promise<PostView[]> {
  const rows = await db
    .select(baseSelect)
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
  return toPostViews(rows)
}

export async function getBookmarkedPosts(): Promise<PostView[]> {
  const userId = await getUserId()
  const mine = await db.select({ postId: bookmarks.postId }).from(bookmarks).where(eq(bookmarks.userId, userId))
  const ids = mine.map((m) => m.postId)
  if (ids.length === 0) return []
  const rows = await db
    .select(baseSelect)
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .where(inArray(posts.id, ids))
    .orderBy(desc(posts.createdAt))
  return toPostViews(rows)
}

export type CreatePostResult = { ok: true } | { ok: false; error: string }

export async function createPost(input: {
  genre: string
  division: string
  form: string
  title: string
  body: string
}): Promise<CreatePostResult> {
  const userId = await getUserId()

  const title = input.title.trim()
  const body = input.body.trim()
  if (!title) return { ok: false, error: "タイトルを入力してください。" }
  if (!body) return { ok: false, error: "本文を入力してください。" }
  if (!GENRES.includes(input.genre as (typeof GENRES)[number]))
    return { ok: false, error: "ジャンルが不正です。" }
  if (!DIVISIONS.includes(input.division as (typeof DIVISIONS)[number]))
    return { ok: false, error: "区分が不正です。" }
  if (!FORMS.includes(input.form as (typeof FORMS)[number]))
    return { ok: false, error: "形態が不正です。" }

  await db.insert(posts).values({
    userId,
    genre: input.genre,
    division: input.division,
    form: input.form,
    title,
    body,
  })

  revalidatePath("/feed")
  revalidatePath("/profile")
  return { ok: true }
}

export async function deletePost(id: number) {
  const userId = await getUserId()
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, userId)))
  revalidatePath("/feed")
  revalidatePath("/profile")
}
