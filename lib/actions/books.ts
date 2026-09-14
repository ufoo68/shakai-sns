"use server"

import { db } from "@/lib/db"
import { books, user } from "@/lib/db/schema"
import { ensureUserStatusColumn } from "@/lib/db/ensure-user-status"
import { ensureBookTranslatorColumn } from "@/lib/db/ensure-book-translator"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"
import { BOOK_STATUSES, type BookView } from "@/lib/data"

export async function getBooksByUser(userId: string): Promise<BookView[]> {
  await Promise.all([ensureUserStatusColumn(), ensureBookTranslatorColumn()])
  const rows = await db
    .select()
    .from(books)
    .leftJoin(user, eq(books.userId, user.id))
    .where(and(eq(books.userId, userId), eq(user.status, "active")))
    .orderBy(desc(books.createdAt))
  return rows.map((r) => ({
    id: r.books.id,
    title: r.books.title,
    author: r.books.author,
    translator: r.books.translator,
    status: r.books.status,
    note: r.books.note,
  }))
}

export async function addBook(input: {
  title: string
  author: string
  translator?: string
  status: string
  note?: string
}) {
  await ensureBookTranslatorColumn()
  const userId = await getUserId()
  const title = input.title.trim()
  const author = input.author.trim()
  if (!title) return
  const status = BOOK_STATUSES.includes(input.status as (typeof BOOK_STATUSES)[number])
    ? input.status
    : "読んだ"
  await db.insert(books).values({
    userId,
    title,
    author: author || "著者不明",
    translator: input.translator?.trim() || "",
    status,
    note: input.note?.trim() || null,
  })
  revalidatePath("/profile")
}

export async function updateBook(
  id: number,
  input: { title: string; author: string; translator?: string; status: string; note?: string },
) {
  await ensureBookTranslatorColumn()
  const userId = await getUserId()
  const title = input.title.trim()
  if (!title) return
  const status = BOOK_STATUSES.includes(input.status as (typeof BOOK_STATUSES)[number])
    ? input.status
    : "読んだ"
  await db
    .update(books)
    .set({
      title,
      author: input.author.trim() || "著者不明",
      translator: input.translator?.trim() || "",
      status,
      note: input.note?.trim() || null,
    })
    .where(and(eq(books.id, id), eq(books.userId, userId)))
  revalidatePath("/profile")
}

export async function deleteBook(id: number) {
  const userId = await getUserId()
  await db.delete(books).where(and(eq(books.id, id), eq(books.userId, userId)))
  revalidatePath("/profile")
}
