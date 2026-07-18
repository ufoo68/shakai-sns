"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateReportStatus, adminDeletePost } from "@/lib/actions/admin"
import type { ReportView } from "@/lib/data"

const STATUS_LABEL: Record<string, string> = {
  open: "未対応",
  resolved: "対応済み",
  dismissed: "却下",
}

export function ReportsTable({ reports }: { reports: ReportView[] }) {
  const [rows, setRows] = useState(reports)
  const [isPending, startTransition] = useTransition()

  function setStatus(id: number, status: "open" | "resolved" | "dismissed") {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    startTransition(() => updateReportStatus(id, status))
  }

  function deletePost(postId: number) {
    if (!confirm("この投稿を削除します。取り消せません。よろしいですか？")) return
    // 同じ投稿への通報行を画面から消す
    setRows((rs) => rs.filter((r) => r.post?.id !== postId))
    startTransition(() => adminDeletePost(postId))
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        通報はまだありません。落ち着いた場が保たれています。
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                r.status === "open"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
            <span className="text-sm font-medium text-foreground">{r.reason}</span>
            <time className="ml-auto text-xs text-muted-foreground">{r.createdAt}</time>
          </div>

          {r.detail && <p className="mt-2 whitespace-pre-line text-pretty text-sm text-muted-foreground">{r.detail}</p>}

          <p className="mt-2 text-xs text-muted-foreground">
            通報者: {r.reporter.name}（@{r.reporter.handle}）
          </p>

          {r.post ? (
            <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
              <p className="text-sm font-medium text-foreground text-pretty">{r.post.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.post.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                投稿者:{" "}
                <Link href={`/u/${r.post.author.handle}`} className="hover:underline">
                  {r.post.author.name}（@{r.post.author.handle}）
                </Link>
              </p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-border bg-background p-3.5 text-sm text-muted-foreground">
              対象の投稿は削除済みです。
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {r.status !== "resolved" && (
              <button
                type="button"
                onClick={() => setStatus(r.id, "resolved")}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-xs font-medium text-secondary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                対応済みにする
              </button>
            )}
            {r.status !== "dismissed" && (
              <button
                type="button"
                onClick={() => setStatus(r.id, "dismissed")}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                却下
              </button>
            )}
            {r.post && (
              <button
                type="button"
                onClick={() => deletePost(r.post!.id)}
                disabled={isPending}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                投稿を削除
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
