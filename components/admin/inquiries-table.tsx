"use client"

import { useState, useTransition } from "react"
import { Check, RotateCcw, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateInquiryStatus } from "@/lib/actions/admin"
import type { InquiryView } from "@/lib/data"

export function InquiriesTable({ inquiries }: { inquiries: InquiryView[] }) {
  const [rows, setRows] = useState(inquiries)
  const [isPending, startTransition] = useTransition()

  function setStatus(id: number, status: "open" | "resolved") {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    startTransition(() => updateInquiryStatus(id, status))
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        問い合わせはまだありません。
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((q) => (
        <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                q.status === "open" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {q.status === "open" ? "未対応" : "対応済み"}
            </span>
            <span className="text-sm font-medium text-foreground">{q.category}</span>
            <time className="ml-auto text-xs text-muted-foreground">{q.createdAt}</time>
          </div>

          <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-foreground">{q.message}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{q.name}</span>
            <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1 hover:text-foreground hover:underline">
              <Mail className="h-3.5 w-3.5" />
              {q.email}
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {q.status === "open" ? (
              <button
                type="button"
                onClick={() => setStatus(q.id, "resolved")}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-xs font-medium text-secondary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                対応済みにする
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStatus(q.id, "open")}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                未対応に戻す
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
