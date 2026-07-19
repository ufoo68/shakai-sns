"use server"

import { db } from "@/lib/db"
import { books, user } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"
import { BOOK_STATUSES, type BookView } from "@/lib/data"

export async function getBooksByUser(userId: string): Promise<BookView[]> {
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
    status: r.books.status,
    note: r.books.note,
  }))
}

export async function addBook(input: {
  title: string
  author: string
  status: string
  note?: string
}) {
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
    status,
    note: input.note?.trim() || null,
  })
  revalidatePath("/profile")
}

export async function deleteBook(id: number) {
  const userId = await getUserId()
  await db.delete(books).where(and(eq(books.id, id), eq(books.userId, userId)))
  revalidatePath("/profile")
}
