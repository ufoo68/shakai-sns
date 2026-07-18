import { betterAuth } from "better-auth"
import { pool, db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"

// メールアドレスから初期ハンドルを生成する
function handleFromEmail(email: string) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user"
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}_${suffix}`.slice(0, 24)
}

export const auth = betterAuth({
  database: pool,
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          // サインアップ時に知的背景プロフィールの土台を作る
          await db
            .insert(profiles)
            .values({
              userId: createdUser.id,
              handle: handleFromEmail(createdUser.email),
              bio: "",
              currentThought: "",
              interests: [],
            })
            .onConflictDoNothing()
        },
      },
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // 開発時のローカル検証用（本番には影響しない）
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:3001", `http://localhost:${process.env.PORT ?? "3000"}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // In dev (v0 preview iframe), force cross-site cookies so the
          // session cookie is stored by the browser.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
