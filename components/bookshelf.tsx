import { cn } from "@/lib/utils"
import { books, type Book } from "@/lib/data"

const STATUS_STYLE: Record<Book["status"], string> = {
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

function BookCover({ book, index }: { book: Book; index: number }) {
  return (
    <div className="group">
      <div
        className={cn(
          "flex aspect-[3/4] flex-col justify-between rounded-lg border border-border/60 p-3 shadow-sm transition-transform group-hover:-translate-y-1",
          COVER_TINTS[index % COVER_TINTS.length],
        )}
      >
        <span className="text-pretty font-display text-sm font-bold leading-snug">
          {book.title}
        </span>
        <span className="text-xs opacity-80">{book.author}</span>
      </div>
      <span
        className={cn(
          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
          STATUS_STYLE[book.status],
        )}
      >
        {book.status}
      </span>
    </div>
  )
}

export function Bookshelf({ compact = false }: { compact?: boolean }) {
  const list = compact ? books.slice(0, 4) : books
  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5",
      )}
    >
      {list.map((book, i) => (
        <BookCover key={book.id} book={book} index={i} />
      ))}
    </div>
  )
}
