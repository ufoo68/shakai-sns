import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// 現在ログイン中ユーザーが管理者かどうか。未ログインなら false。
export async function isAdmin() {
  const session = await getSession()
  if (!session?.user) return false
  const rows = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return rows[0]?.role === "admin"
}

// 管理者専用の操作で使用。管理者でなければ例外を投げる。
export async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  const rows = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (rows[0]?.role !== "admin") throw new Error("Forbidden")
  return session.user.id
}

// 認証必須の操作で使用。未ログインなら例外を投げる。
export async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

// 公開ページで「自分の状態」を反映するために使用。未ログインなら null。
export async function getOptionalUserId() {
  const session = await getSession()
  return session?.user?.id ?? null
}
