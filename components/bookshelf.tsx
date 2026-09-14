"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOOK_STATUSES, type BookView } from "@/lib/data"
import { addBook, deleteBook, updateBook } from "@/lib/actions/books"

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

function BookCover({ book, index, onEdit }: { book: BookView; index: number; onEdit?: () => void }) {
  return (
    <div className="group relative">
      <div
        className={cn(
          "flex aspect-[3/4] flex-col justify-between rounded-lg border border-border/60 p-3 shadow-sm transition-transform group-hover:-translate-y-1",
          COVER_TINTS[index % COVER_TINTS.length],
        )}
      >
        <span className="line-clamp-4 text-pretty font-display text-sm font-bold leading-snug">{book.title}</span>
        <div className="min-w-0 text-xs opacity-80">
          <div className="truncate">{book.author}</div>
          {book.translator && <div className="truncate">訳：{book.translator}</div>}
        </div>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`「${book.title}」を編集`}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
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
  const [editingBook, setEditingBook] = useState<BookView | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [translator, setTranslator] = useState("")
  const [status, setStatus] = useState<string>(BOOK_STATUSES[0])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function openForm(book: BookView | null = null) {
    setEditingBook(book)
    setTitle(book?.title ?? "")
    setAuthor(book?.author ?? "")
    setTranslator(book?.translator ?? "")
    setStatus(book?.status ?? BOOK_STATUSES[0])
    setConfirmingDelete(false)
    setOpen(true)
  }

  function closeForm() {
    if (isPending) return
    setOpen(false)
    setConfirmingDelete(false)
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      const input = { title, author, translator, status }
      if (editingBook) await updateBook(editingBook.id, input)
      else await addBook(input)
      setOpen(false)
      router.refresh()
    })
  }

  function onDelete() {
    if (!editingBook) return
    startTransition(async () => {
      await deleteBook(editingBook.id)
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
          <BookCover key={book.id} book={book} index={i} onEdit={editable ? () => openForm(book) : undefined} />
        ))}

        {editable && (
          <button
            type="button"
            onClick={() => openForm()}
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
          aria-label={editingBook ? "本を編集" : "本を追加"}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm()
          }}
        >
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingBook ? "本の登録内容を編集" : "本棚に追加"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onSave} className="mt-4 flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="書名"
                className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="著者"
                className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                value={translator}
                onChange={(e) => setTranslator(e.target.value)}
                placeholder="翻訳者（任意）"
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
              <div className="mt-1 flex items-center gap-2">
                {editingBook && (
                  confirmingDelete ? (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={isPending}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                    >
                      {isPending ? "削除中…" : "本当に削除する"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      削除
                    </button>
                  )
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="ml-auto inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "保存中…" : editingBook ? "変更を保存" : "追加する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
