"use server"

import { db } from "@/lib/db"
import { posts, empathies, comments, bookmarks, profiles, user, follows } from "@/lib/db/schema"
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm"
import { getOptionalUserId } from "@/lib/session"
import { formatRelative } from "@/lib/format"
import type { PostView } from "@/lib/data"
import type { SuggestedUser } from "@/lib/actions/profile"

function excerptOf(body: string) {
  const oneLine = body.replace(/\s+/g, " ").trim()
  return oneLine.length > 120 ? oneLine.slice(0, 120) + "…" : oneLine
}

export type SearchResult = {
  posts: PostView[]
  users: SuggestedUser[]
}

export async function search(query: string): Promise<SearchResult> {
  const q = query.trim()
  if (!q) return { posts: [], users: [] }
  const like = `%${q}%`
  const me = await getOptionalUserId()

  // --- 投稿検索(タイトル or 本文) ---
  const postRows = await db
    .select({
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
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .where(and(or(ilike(posts.title, like), ilike(posts.body, like)), eq(user.status, "active")))
    .orderBy(desc(posts.createdAt))
    .limit(30)

  const postViews = await buildPostViews(postRows, me)

  // --- ユーザー検索(名前 or ハンドル or 自己紹介) ---
  const userRows = await db
    .select({
      userId: profiles.userId,
      handle: profiles.handle,
      interests: profiles.interests,
      name: user.name,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(and(or(ilike(user.name, like), ilike(profiles.handle, like), ilike(profiles.bio, like)), eq(user.status, "active")))
    .limit(20)

  let myFollows = new Set<string>()
  if (me) {
    const f = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.userId, me))
    myFollows = new Set(f.map((x) => x.followingId))
  }

  const users: SuggestedUser[] = userRows.map((r) => ({
    userId: r.userId,
    name: r.name ?? "退会したユーザー",
    handle: r.handle,
    interests: r.interests,
    followedByMe: myFollows.has(r.userId),
  }))

  return { posts: postViews, users }
}

// posts.ts の toPostViews と同等の整形(集計 + 自分の反応)
async function buildPostViews(
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
  me: string | null,
): Promise<PostView[]> {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const [emp, com, bmk] = await Promise.all([
    db
      .select({ postId: empathies.postId, userId: empathies.userId })
      .from(empathies)
      .leftJoin(user, eq(empathies.userId, user.id))
      .where(and(inArray(empathies.postId, ids), eq(user.status, "active"))),
    db
      .select({ postId: comments.postId })
      .from(comments)
      .leftJoin(user, eq(comments.userId, user.id))
      .where(and(inArray(comments.postId, ids), eq(user.status, "active"))),
    db
      .select({ postId: bookmarks.postId, userId: bookmarks.userId })
      .from(bookmarks)
      .leftJoin(user, eq(bookmarks.userId, user.id))
      .where(and(inArray(bookmarks.postId, ids), eq(user.status, "active"))),
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
    author: { id: r.userId, name: r.authorName ?? "退会したユーザー", handle: r.handle ?? "unknown" },
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
