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

// フィード等で使う整形済み投稿データ
export type PostView = {
  id: number
  author: { id: string; name: string; handle: string }
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
