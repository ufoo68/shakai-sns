// shakai — 分類定義と共有型
// 実データは Neon (Drizzle) から取得します。ここは分類の定義のみ。

export const GENRES = ["政治", "歴史", "経済", "社会", "国際関係", "文化", "思想"] as const
export type Genre = (typeof GENRES)[number]

// 区分: 投稿がどんな性質のものか
export const DIVISIONS = ["学び", "考察", "問い", "意見"] as const
export type Division = (typeof DIVISIONS)[number]

// 形態: 投稿の形式
export const FORMS = ["短文", "長文", "書評", "引用"] as const
export type Form = (typeof FORMS)[number]

// 本棚の読書状態
export const BOOK_STATUSES = ["読んだ", "読んでいる", "読みたい"] as const
export type BookStatus = (typeof BOOK_STATUSES)[number]

// フィード等で使う整形済み投稿データ
export type PostView = {
  id: number
  author: { id: string; name: string; handle: string; avatarUrl: string | null }
  createdAt: string
  genre: string
  division: string
  form: string
  title: string
  excerpt: string
  empathy: number
  comments: number
  bookmarks: number
  empathizedByMe: boolean
  bookmarkedByMe: boolean
}

export type ProfileView = {
  userId: string
  name: string
  handle: string
  bio: string
  currentThought: string
  interests: string[]
  avatarUrl: string | null
  postCount: number
  followingCount: number
  followerCount: number
  isMe: boolean
  followedByMe: boolean
}

export type BookView = {
  id: number
  title: string
  author: string
  status: string
  note: string | null
}

// --- 管理画面用の型と定義 --------------------------------------------------

// 通報理由の分類
export const REPORT_REASONS = ["スパム・宣伝", "誹謗中傷・嫌がらせ", "誤情報", "その他"] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

// 問い合わせの分類
export const INQUIRY_CATEGORIES = ["不具合の報告", "機能の要望", "アカウントについて", "その他"] as const
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number]

export type AdminUserView = {
  id: string
  name: string
  email: string
  handle: string
  role: string
  postCount: number
  createdAt: string
  isMe: boolean
}

export type ReportView = {
  id: number
  reason: string
  detail: string
  status: string
  createdAt: string
  reporter: { name: string; handle: string }
  post: {
    id: number
    title: string
    excerpt: string
    author: { id: string; name: string; handle: string }
  } | null
}

export type InquiryView = {
  id: number
  name: string
  email: string
  category: string
  message: string
  status: string
  createdAt: string
}

export type AdminPostView = {
  id: number
  title: string
  excerpt: string
  genre: string
  createdAt: string
  author: { id: string; name: string; handle: string }
  empathy: number
  comments: number
  reportCount: number
}

// ジャンルごとの淡い色付け(トークンベースの控えめな配色)
export const genreTint: Record<string, string> = {
  政治: "bg-accent text-accent-foreground",
  歴史: "bg-secondary text-secondary-foreground",
  経済: "bg-accent text-accent-foreground",
  社会: "bg-secondary text-secondary-foreground",
  国際関係: "bg-accent text-accent-foreground",
  文化: "bg-secondary text-secondary-foreground",
  思想: "bg-accent text-accent-foreground",
}

export function genreTintOf(genre: string) {
  return genreTint[genre] ?? "bg-secondary text-secondary-foreground"
}
