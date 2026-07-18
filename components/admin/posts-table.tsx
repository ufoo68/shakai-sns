"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Flag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { genreTintOf } from "@/lib/data"
import { adminDeletePost } from "@/lib/actions/admin"
import type { AdminPostView } from "@/lib/data"

export function PostsTable({ posts }: { posts: AdminPostView[] }) {
  const [rows, setRows] = useState(posts)
  const [isPending, startTransition] = useTransition()

  function deletePost(id: number) {
    if (!confirm("この投稿を削除します。取り消せません。よろしいですか？")) return
    setRows((rs) => rs.filter((p) => p.id !== id))
    startTransition(() => adminDeletePost(id))
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        投稿はまだありません。
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((p) => (
        <li key={p.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", genreTintOf(p.genre))}>
              {p.genre}
            </span>
            {p.reportCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <Flag className="h-3 w-3" />
                {p.reportCount}
              </span>
            )}
            <time className="ml-auto text-xs text-muted-foreground">{p.createdAt}</time>
          </div>

          <p className="mt-2 text-pretty font-medium text-foreground">{p.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link href={`/u/${p.author.handle}`} className="hover:text-foreground hover:underline">
              {p.author.name}（@{p.author.handle}）
            </Link>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {p.empathy}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {p.comments}
            </span>
          </div>

          <div className="mt-4 flex items-center">
            <button
              type="button"
              onClick={() => deletePost(p.id)}
              disabled={isPending}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              削除
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
