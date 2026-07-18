import { Bookmark, Heart, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { genreTint, type Post } from "@/lib/data"

function Meta({ children, tone = "default" }: { children: React.ReactNode; tone?: "genre" | "default" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Heart
  value: number
  label: string
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      <span className="tabular-nums">{value}</span>
      <span className="sr-only">{label}</span>
    </button>
  )
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6">
      {/* 著者行 */}
      <div className="flex items-center gap-3">
        <Avatar name={post.author.name} className="h-10 w-10 text-sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="truncate font-medium text-foreground">{post.author.name}</span>
            <span className="truncate text-muted-foreground">@{post.author.handle}</span>
          </div>
          <time className="text-xs text-muted-foreground">{post.createdAt}</time>
        </div>
      </div>

      {/* 分類 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            genreTint[post.genre],
          )}
        >
          {post.genre}
        </span>
        <Meta>{post.division}</Meta>
        <Meta>{post.form}</Meta>
      </div>

      {/* 本文 */}
      <h2 className="mt-3 text-pretty text-lg font-bold leading-snug text-foreground">
        {post.title}
      </h2>
      <p className="mt-2 line-clamp-2 leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      {/* 反応 */}
      <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-3">
        <Stat icon={Heart} value={post.empathy} label="共感" />
        <Stat icon={MessageCircle} value={post.comments} label="コメント" />
        <Stat icon={Bookmark} value={post.bookmarks} label="ブックマーク" />
      </div>
    </article>
  )
}
