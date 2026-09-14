import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

const MAX_BYTES = 4 * 1024 * 1024 // 4MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(request: NextRequest) {
  // ログイン必須
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "画像ファイル（JPEG/PNG/WebP/GIF）を選択してください" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "画像は4MB以下にしてください" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "png"
    // ユーザーIDごとにパスを分け、キャッシュ衝突を避けるためランダムサフィックスを付ける
    const blob = await put(`avatars/${session.user.id}-${Date.now()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 })
  }
}
