import Link from "next/link"
import { ArrowRight, MessagesSquare, Layers, BookOpen } from "lucide-react"
import { ShakaiLogo } from "@/components/shakai-logo"
import { PostCard } from "@/components/post-card"
import { GENRES } from "@/lib/data"
import { getFeedPosts } from "@/lib/actions/posts"
import { getOptionalUserId } from "@/lib/session"

const VALUES = [
  {
    icon: Layers,
    title: "多様な視点を並べる",
    body: "答えをひとつに決めるためではなく、違う見方を隣に置くための場所です。",
  },
  {
    icon: MessagesSquare,
    title: "建設的に対話する",
    body: "否定や勝ち負けではなく、理解を深めるためのやりとりを大切にします。",
  },
  {
    icon: BookOpen,
    title: "知的な背景を共有する",
    body: "何を読み、何を考えてきたか。その人の視点の土台がゆるやかに伝わります。",
  },
]

export default async function Page() {
  const [posts, me] = await Promise.all([getFeedPosts(2), getOptionalUserId()])
  const isAuthed = !!me

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* シンプルなトップバー */}
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <ShakaiLogo className="text-base" />
        <div className="flex items-center gap-2">
          <Link
            href={isAuthed ? "/feed" : "/sign-in"}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            {isAuthed ? "フィードへ" : "ログイン"}
          </Link>
          <Link
            href={isAuthed ? "/feed" : "/sign-up"}
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {isAuthed ? "はじめる" : "無料ではじめる"}
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-24">
        <ShakaiLogo className="justify-center text-4xl sm:text-5xl" />
        <h1 className="mt-8 text-balance font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          社会について考え、語り合う
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          あなたの視点が、誰かの視野を広げる。
        </p>
        <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          shakai は、歴史・政治・経済・社会などについて、学んだことや考えたことを共有し、
          多様な視点から対話するためのSNSです。
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/feed"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            フィードを見る
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={isAuthed ? "/profile" : "/sign-up"}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border bg-card px-7 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            {isAuthed ? "プロフィールを見る" : "アカウントをつくる"}
          </Link>
        </div>

        {/* 扱うジャンル */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {GENRES.map((g) => (
            <span key={g} className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              {g}
            </span>
          ))}
        </div>
      </section>

      {/* 3つの価値 */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* フィードのプレビュー */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
          <div className="mb-5 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight">こんな投稿が生まれています</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              落ち着いたトーンで、じっくり考えたことを共有できます。
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} isAuthed={isAuthed} currentUserId={me} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              すべてのフィードを見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* フッター */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
          <ShakaiLogo className="text-sm" />
          <p className="text-sm text-muted-foreground">社会について、安心して話せる場所を。</p>
        </div>
      </footer>
    </div>
  )
}
