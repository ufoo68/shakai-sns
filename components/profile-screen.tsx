import { BookOpen, MessageSquareText } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Bookshelf } from "@/components/bookshelf"
import { PostCard } from "@/components/post-card"
import { ProfilePanel } from "@/components/profile-panel"
import type { BookView, PostView, ProfileView } from "@/lib/data"

export function ProfileScreen({
  profile,
  posts,
  books,
  isAuthed,
  currentUserId = null,
}: {
  profile: ProfileView
  posts: PostView[]
  books: BookView[]
  isAuthed: boolean
  currentUserId?: string | null
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ProfilePanel profile={profile} isAuthed={isAuthed} />

        {/* 本棚 — 知的背景 */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">本棚</h2>
            </div>
            <span className="text-right text-xs text-muted-foreground">読んできた本が、視点の土台になる</span>
          </div>
          <div className="mt-4">
            <Bookshelf books={books} editable={profile.isMe} />
          </div>
        </section>

        {/* 最近の投稿 */}
        <section className="mt-4">
          <div className="flex items-center gap-2 px-1">
            <MessageSquareText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">最近の投稿</h2>
          </div>
          <div className="mt-3 flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} isAuthed={isAuthed} currentUserId={currentUserId} />
            ))}
            {posts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                まだ投稿がありません。
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
