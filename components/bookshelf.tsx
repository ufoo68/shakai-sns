"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOOK_STATUSES, type BookView } from "@/lib/data"
import { addBook } from "@/lib/actions/books"

const STATUS_STYLE: Record<string, string> = {
  読んだ: "bg-primary/10 text-primary",
  読んでいる: "bg-accent text-accent-foreground",
  読みたい: "bg-muted text-muted-foreground",
}

// 表紙の淡い地色をタイトルから決める
const COVER_TINTS = [
  "bg-[oklch(0.95_0.03_205)] text-[oklch(0.38_0.06_205)]",
  "bg-[oklch(0.95_0.03_235)] text-[oklch(0.38_0.06_235)]",
  "bg-[oklch(0.95_0.03_170)] text-[oklch(0.38_0.06_170)]",
  "bg-[oklch(0.96_0.025_255)] text-[oklch(0.38_0.06_255)]",
]

function BookCover({ book, index }: { book: BookView; index: number }) {
  return (
    <div className="group">
      <div
        className={cn(
          "flex aspect-[3/4] flex-col justify-between rounded-lg border border-border/60 p-3 shadow-sm transition-transform group-hover:-translate-y-1",
          COVER_TINTS[index % COVER_TINTS.length],
        )}
      >
        <span className="line-clamp-4 text-pretty font-display text-sm font-bold leading-snug">{book.title}</span>
        <span className="truncate text-xs opacity-80">{book.author}</span>
      </div>
      <span
        className={cn(
          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
          STATUS_STYLE[book.status] ?? STATUS_STYLE["読んだ"],
        )}
      >
        {book.status}
      </span>
    </div>
  )
}

export function Bookshelf({ books, editable = false }: { books: BookView[]; editable?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [status, setStatus] = useState<string>(BOOK_STATUSES[0])

  function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      await addBook({ title, author, status })
      setTitle("")
      setAuthor("")
      setStatus(BOOK_STATUSES[0])
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div>
      {books.length === 0 && !editable && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          まだ本が並んでいません。
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {books.map((book, i) => (
          <BookCover key={book.id} book={book} index={i} />
        ))}

        {editable && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">本を追加</span>
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="本を追加"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">本棚に追加</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onAdd} className="mt-4 flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="書名"
                className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="著者"
                className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
              >
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "追加中…" : "追加する"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
