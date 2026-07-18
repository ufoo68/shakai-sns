import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { FeedView } from "@/components/feed-view"
import { Avatar } from "@/components/avatar"
import { GENRES, users } from "@/lib/data"

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex max-w-5xl gap-8 px-4 py-6 sm:px-6">
        {/* メインカラム */}
        <div className="min-w-0 flex-1">
          <div className="mb-2">
            <h1 className="font-display text-xl font-bold tracking-tight">フィード</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              いま考えられていることを、落ち着いて眺める。
            </p>
          </div>
          <FeedView />
        </div>

        {/* サイドバー (デスクトップ) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold text-foreground">よく読まれているジャンル</h2>
              <ul className="mt-3 flex flex-col gap-1">
                {GENRES.slice(0, 5).map((g, i) => (
                  <li key={g}>
                    <Link
                      href="/feed"
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span>{g}</span>
                      <span className="tabular-nums text-xs">{120 - i * 18} 件</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold text-foreground">気になる人</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {users.slice(0, 3).map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <Avatar name={u.name} className="h-9 w-9 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.interests.join("・")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      フォロー
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <p className="px-2 text-xs leading-relaxed text-muted-foreground">
              shakai は、意見の違いを消すのではなく、並べて考えるための場所です。
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
