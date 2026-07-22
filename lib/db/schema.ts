import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  // "user" | "admin" — 管理画面へのアクセス権を制御する
  role: text("role").notNull().default("user"),
  // "active" | "frozen" — 凍結ユーザーは投稿・反応などの操作と公開表示から除外する
  status: text("status").notNull().default("active"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Every app table carries a plain `userId` column for per-user scoping.
// No foreign keys by default.

// その人の知的背景を表すプロフィール拡張
export const profiles = pgTable("profiles", {
  userId: text("userId").primaryKey(),
  handle: text("handle").notNull(),
  bio: text("bio").notNull().default(""),
  currentThought: text("currentThought").notNull().default(""),
  interests: text("interests").array().notNull().default([]),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  genre: text("genre").notNull(),
  division: text("division").notNull(),
  form: text("form").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// 共感(いいねに相当)
export const empathies = pgTable("empathies", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  postId: integer("postId").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  postId: integer("postId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  postId: integer("postId").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(), // フォローする人
  followingId: text("followingId").notNull(), // フォローされる人
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// 本棚
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  translator: text("translator").notNull().default(""),
  status: text("status").notNull().default("読んだ"),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// 通知: 自分の投稿への共感・コメント、自分へのフォロー
// userId = 通知の受信者, actorId = 行動した人
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(), // 受信者
  actorId: text("actorId").notNull(), // 通知のきっかけを作った人
  type: text("type").notNull(), // "empathy" | "comment" | "follow"
  postId: integer("postId"), // フォロー通知では null
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// 通報: ユーザーが不適切な投稿を報告する
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: text("reporterId").notNull(), // 通報した人
  postId: integer("postId").notNull(), // 対象の投稿
  reason: text("reason").notNull(), // 分類 (スパム/誹謗中傷 など)
  detail: text("detail").notNull().default(""), // 補足
  status: text("status").notNull().default("open"), // "open" | "resolved" | "dismissed"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// 問い合わせ: 運営への連絡フォーム
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: text("userId"), // 送信者(ログインしていれば)。未ログインは null
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category").notNull().default("その他"),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // "open" | "resolved"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
