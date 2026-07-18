"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { genreTintOf, type PostView } from "@/lib/data"
import { toggleEmpathy, toggleBookmark, getComments, addComment, type CommentView } from "@/lib/actions/interactions"

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

export function PostCard({ post, isAuthed }: { post: PostView; isAuthed: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [empathized, setEmpathized] = useState(post.empathizedByMe)
  const [empathyCount, setEmpathyCount] = useState(post.empathy)
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByMe)
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks)

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentView[] | null>(null)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [draft, setDraft] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)

  function requireAuth(action: () => void) {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    action()
  }

  function onEmpathy() {
    requireAuth(() => {
      // 楽観的更新
      setEmpathized((v) => !v)
      setEmpathyCount((c) => c + (empathized ? -1 : 1))
      startTransition(async () => {
        const res = await toggleEmpathy(post.id)
        setEmpathized(res.active)
        setEmpathyCount(res.count)
      })
    })
  }

  function onBookmark() {
    requireAuth(() => {
      setBookmarked((v) => !v)
      setBookmarkCount((c) => c + (bookmarked ? -1 : 1))
      startTransition(async () => {
        const res = await toggleBookmark(post.id)
        setBookmarked(res.active)
        setBookmarkCount(res.count)
      })
    })
  }

  async function onToggleComments() {
    const next = !showComments
    setShowComments(next)
    if (next && comments === null) {
      setLoadingComments(true)
      const list = await getComments(post.id)
      setComments(list)
      setCommentCount(list.length)
      setLoadingComments(false)
    }
  }

  function onSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body) return
    requireAuth(() => {
      setDraft("")
      startTransition(async () => {
        await addComment(post.id, body)
        const list = await getComments(post.id)
        setComments(list)
        setCommentCount(list.length)
      })
    })
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6">
      {/* 著者行 */}
      <div className="flex items-center gap-3">
        <Link href={`/u/${post.author.handle}`} className="shrink-0">
          <Avatar name={post.author.name} className="h-10 w-10 text-sm" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <Link href={`/u/${post.author.handle}`} className="truncate font-medium text-foreground hover:underline">
              {post.author.name}
            </Link>
            <span className="truncate text-muted-foreground">@{post.author.handle}</span>
          </div>
          <time className="text-xs text-muted-foreground">{post.createdAt}</time>
        </div>
      </div>

      {/* 分類 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", genreTintOf(post.genre))}>
          {post.genre}
        </span>
        <Meta>{post.division}</Meta>
        <Meta>{post.form}</Meta>
      </div>

      {/* 本文 */}
      <h2 className="mt-3 text-pretty text-lg font-bold leading-snug text-foreground">{post.title}</h2>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{post.excerpt}</p>

      {/* 反応 */}
      <div className="mt-4 flex items-center gap-1 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={onEmpathy}
          disabled={isPending}
          aria-pressed={empathized}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors",
            empathized ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", empathized && "fill-current")} />
          <span className="tabular-nums">{empathyCount}</span>
          <span className="sr-only">共感</span>
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="tabular-nums">{commentCount}</span>
          <span className="sr-only">コメント</span>
        </button>

        <button
          type="button"
          onClick={onBookmark}
          disabled={isPending}
          aria-pressed={bookmarked}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors",
            bookmarked ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          <span className="tabular-nums">{bookmarkCount}</span>
          <span className="sr-only">ブックマーク</span>
        </button>
      </div>

      {/* コメント欄 */}
      {showComments && (
        <div className="mt-3 border-t border-border/70 pt-4">
          <form onSubmit={onSubmitComment} className="flex items-start gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isAuthed ? "建設的なコメントを添える…" : "コメントするにはログイン"}
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="submit"
              disabled={isPending || !draft.trim()}
              aria-label="コメントを送信"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-4">
            {loadingComments && <p className="text-sm text-muted-foreground">読み込み中…</p>}
            {comments?.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar name={c.author.name} className="h-8 w-8 text-xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="truncate font-medium text-foreground">{c.author.name}</span>
                    <span className="truncate text-xs text-muted-foreground">@{c.author.handle}</span>
                    <time className="ml-auto shrink-0 text-xs text-muted-foreground">{c.createdAt}</time>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-pretty leading-relaxed text-foreground">{c.body}</p>
                </div>
              </div>
            ))}
            {comments && comments.length === 0 && !loadingComments && (
              <p className="text-sm text-muted-foreground">まだコメントはありません。最初の視点を添えてみましょう。</p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
