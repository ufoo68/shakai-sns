import { BookOpen, MapPin, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Avatar } from "@/components/avatar"
import { Bookshelf } from "@/components/bookshelf"
import { PostCard } from "@/components/post-card"
import { posts, users } from "@/lib/data"

export default function ProfilePage() {
  const user = users[1]
  const userPosts = posts.filter((p) => p.author.id === user.id)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* プロフィールヘッダー */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <Avatar name={user.name} className="h-16 w-16 text-xl" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-sm text-muted-foreground">@{user.handle}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              フォロー
            </button>
          </div>

          <p className="mt-4 leading-relaxed text-foreground">{user.bio}</p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">124</span> 投稿
            </span>
            <span>
              <span className="font-semibold text-foreground">318</span> フォロー
            </span>
            <span>
              <span className="font-semibold text-foreground">1,092</span> フォロワー
            </span>
          </div>
        </section>

        {/* いま考えていること — 「何について考えている人か」を最上位に */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">いま考えていること</h2>
          </div>
          <p className="mt-3 text-pretty leading-relaxed text-foreground">
            「経済成長の指標が、暮らしの豊かさとどこでずれるのか」を追っています。
            数字と生活の距離を、丁寧に埋めていきたい。
          </p>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            興味のあるジャンル
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.interests.map((g) => (
              <span
                key={g}
                className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
              >
                {g}
              </span>
            ))}
          </div>
        </section>

        {/* 本棚 — 知的背景 */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">本棚</h2>
            </div>
            <span className="text-xs text-muted-foreground">読んできた本が、視点の土台になる</span>
          </div>
          <div className="mt-4">
            <Bookshelf />
          </div>
        </section>

        {/* 最近の投稿 */}
        <section className="mt-4">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">最近の投稿</h2>
          </div>
          <div className="mt-3 flex flex-col gap-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
