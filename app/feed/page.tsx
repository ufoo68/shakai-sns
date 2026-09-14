import { SiteHeader } from "@/components/site-header"
import { FeedView } from "@/components/feed-view"
import { PostComposer } from "@/components/post-composer"
import { FollowSuggestions } from "@/components/follow-suggestions"
import { GENRES } from "@/lib/data"
import { getFeedPosts } from "@/lib/actions/posts"
import { getSuggestedUsers } from "@/lib/actions/profile"
import { getOptionalUserId } from "@/lib/session"

export default async function FeedPage() {
  const [posts, suggestions, me] = await Promise.all([
    getFeedPosts(),
    getSuggestedUsers(4),
    getOptionalUserId(),
  ])
  const isAuthed = !!me

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex max-w-5xl gap-8 px-4 py-6 sm:px-6">
        {/* メインカラム */}
        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <h1 className="font-display text-xl font-bold tracking-tight">フィード</h1>
            <p className="mt-1 text-sm text-muted-foreground">いま考えられていることを、落ち着いて眺める。</p>
          </div>

          <div className="mb-4">
            <PostComposer isAuthed={isAuthed} variant="block" />
          </div>

          <FeedView posts={posts} isAuthed={isAuthed} currentUserId={me} />
        </div>

        {/* サイドバー (デスクトップ) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold text-foreground">扱うジャンル</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {g}
                  </span>
                ))}
              </div>
            </section>

            <FollowSuggestions users={suggestions} isAuthed={isAuthed} />

            <p className="px-2 text-xs leading-relaxed text-muted-foreground">
              shakai は、意見の違いを消すのではなく、並べて考えるための場所です。
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
