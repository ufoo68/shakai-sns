"use server"

import { db } from "@/lib/db"
import { reports, inquiries } from "@/lib/db/schema"
import { getOptionalUserId } from "@/lib/session"
import { REPORT_REASONS, INQUIRY_CATEGORIES } from "@/lib/data"

export type ActionResult = { ok: true } | { ok: false; error: string }

// 投稿を通報する(ログイン必須)
export async function reportPost(input: {
  postId: number
  reason: string
  detail?: string
}): Promise<ActionResult> {
  const userId = await getOptionalUserId()
  if (!userId) return { ok: false, error: "通報するにはログインが必要です。" }

  if (!REPORT_REASONS.includes(input.reason as (typeof REPORT_REASONS)[number]))
    return { ok: false, error: "通報の理由を選んでください。" }

  await db.insert(reports).values({
    reporterId: userId,
    postId: input.postId,
    reason: input.reason,
    detail: (input.detail ?? "").trim(),
  })

  return { ok: true }
}

// 運営への問い合わせを送信する(未ログインでも可)
export async function submitInquiry(input: {
  name: string
  email: string
  category: string
  message: string
}): Promise<ActionResult> {
  const userId = await getOptionalUserId()

  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()

  if (!name) return { ok: false, error: "お名前を入力してください。" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "メールアドレスの形式が正しくありません。" }
  if (!message) return { ok: false, error: "内容を入力してください。" }

  const category = INQUIRY_CATEGORIES.includes(input.category as (typeof INQUIRY_CATEGORIES)[number])
    ? input.category
    : "その他"

  await db.insert(inquiries).values({
    userId: userId ?? null,
    name,
    email,
    category,
    message,
  })

  return { ok: true }
}
