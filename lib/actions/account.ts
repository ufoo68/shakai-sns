"use server"

import { isAdmin } from "@/lib/session"

// ヘッダーなどクライアント側で管理者リンクの表示を制御するために使う。
export async function getMyIsAdmin(): Promise<boolean> {
  return isAdmin()
}
