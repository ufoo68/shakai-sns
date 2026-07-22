"use client"

import { useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bookmark, ChevronDown, ChevronUp, Heart, MessageCircle, Send, SquarePen, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { ReportButton } from "@/components/report-button"
import { DIVISIONS, FORMS, GENRES, genreTintOf, type PostView } from "@/lib/data"
import { deletePost, updatePost } from "@/lib/actions/posts"
import { toggleEmpathy, toggleBookmark, getComments, addComment, type CommentView } from "@/lib/actions/interactions"

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function isLongBody(body: string) {
  return body.replace(/\s+/g, " ").trim().length > 120
}

function excerptOf(body: string) {
  const oneLine = body.replace(/\s+/g, " ").trim()
  return oneLine.length > 120 ? oneLine.slice(0, 120) + "…" : oneLine
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const selectClass =
  "h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"

export function PostCard({
  post,
  isAuthed,
  currentUserId = null,
}: {
  post: PostView
  isAuthed: boolean
  currentUserId?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentGenre, setCurrentGenre] = useState(post.genre)
  const [currentDivision, setCurrentDivision] = useState(post.division)
  const [currentForm, setCurrentForm] = useState(post.form)
  const [currentTitle, setCurrentTitle] = useState(post.title)
  const [currentBody, setCurrentBody] = useState(post.body)

  const [empathized, setEmpathized] = useState(post.empathizedByMe)
  const [empathyCount, setEmpathyCount] = useState(post.empathy)
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByMe)
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks)
  const [expanded, setExpanded] = useState(false)

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentView[] | null>(null)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [draft, setDraft] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editGenre, setEditGenre] = useState(post.genre)
  const [editDivision, setEditDivision] = useState(post.division)
  const [editForm, setEditForm] = useState(post.form)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editBody, setEditBody] = useState(post.body)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const isMine = currentUserId === post.author.id

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

  function openEdit() {
    setEditGenre(currentGenre)
    setEditDivision(currentDivision)
    setEditForm(currentForm)
    setEditTitle(currentTitle)
    setEditBody(currentBody)
    setEditError(null)
    setEditOpen(true)
  }

  function onSubmitEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditError(null)
    startTransition(async () => {
      const res = await updatePost(post.id, {
        genre: editGenre,
        division: editDivision,
        form: editForm,
        title: editTitle,
        body: editBody,
      })
      if (!res.ok) {
        setEditError(res.error)
        return
      }
      setCurrentGenre(editGenre)
      setCurrentDivision(editDivision)
      setCurrentForm(editForm)
      setCurrentTitle(editTitle.trim())
      setCurrentBody(editBody.trim())
      setExpanded(true)
      setEditOpen(false)
      router.refresh()
    })
  }

  function onDelete() {
    startTransition(async () => {
      await deletePost(post.id)
      setDeleted(true)
      setDeleteOpen(false)
      router.refresh()
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

  const canExpand = isLongBody(currentBody)
  const displayedBody = expanded ? currentBody : excerptOf(currentBody)

  if (deleted) return null

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
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {isMine && (
            <>
              <button
                type="button"
                onClick={openEdit}
                aria-label="投稿を編集"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <SquarePen className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                aria-label="投稿を削除"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <ReportButton postId={post.id} isAuthed={isAuthed} />
        </div>
      </div>

      {/* 分類 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", genreTintOf(currentGenre))}>
          {currentGenre}
        </span>
        <Meta>{currentDivision}</Meta>
        <Meta>{currentForm}</Meta>
      </div>

      {/* 本文 */}
      <h2 className="mt-3 text-pretty text-lg font-bold leading-snug text-foreground">{currentTitle}</h2>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{displayedBody}</p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 rounded-full px-1 py-1 text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>
              閉じる
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              続きを読む
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}

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
          <form onSubmit={onSubmitComment} className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isAuthed ? "建設的なコメントを添える…" : "コメントするにはログイン"}
              rows={3}
              className="min-h-24 min-w-0 flex-1 resize-y rounded-xl border border-border bg-background px-4 py-3 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
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

      {editOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="投稿を編集"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditOpen(false)
            }}
          >
            <div className="flex max-h-[92svh] w-full max-w-xl flex-col rounded-t-3xl border border-border bg-card sm:rounded-3xl">
              <div className="flex shrink-0 items-center justify-between p-5 pb-3 sm:p-6 sm:pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">投稿を編集</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  aria-label="閉じる"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={onSubmitEdit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="ジャンル">
                      <select value={editGenre} onChange={(e) => setEditGenre(e.target.value)} className={selectClass}>
                        {GENRES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="区分">
                      <select value={editDivision} onChange={(e) => setEditDivision(e.target.value)} className={selectClass}>
                        {DIVISIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="形態">
                      <select value={editForm} onChange={(e) => setEditForm(e.target.value)} className={selectClass}>
                        {FORMS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="タイトル">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="考えのタイトル"
                      maxLength={120}
                      className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                  </Field>

                  <Field label="本文">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="学んだこと・考えたことを、落ち着いて書いてみましょう。"
                      rows={7}
                      className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                  </Field>

                  {editError && (
                    <p className="text-sm text-destructive" role="alert">
                      {editError}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    やめる
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                      "inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
                      isPending && "opacity-60",
                    )}
                  >
                    {isPending ? "保存中…" : "保存する"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {deleteOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="投稿を削除"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteOpen(false)
            }}
          >
            <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">投稿を削除</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    この投稿を削除します。コメント、共感、ブックマークも一緒に削除されます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  aria-label="閉じる"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  やめる
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full bg-destructive px-6 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90",
                    isPending && "opacity-60",
                  )}
                >
                  {isPending ? "削除中…" : "削除する"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </article>
  )
}
