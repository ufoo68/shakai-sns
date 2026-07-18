import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
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
