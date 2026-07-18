"use client"

import { useState, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Flag, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { REPORT_REASONS } from "@/lib/data"
import { reportPost } from "@/lib/actions/support"

export function ReportButton({ postId, isAuthed }: { postId: number; isAuthed: boolean }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reason, setReason] = useState<string>(REPORT_REASONS[0])
  const [detail, setDetail] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!dialogOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [dialogOpen])

  function openDialog() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    setMenuOpen(false)
    setDone(false)
    setError(null)
    setDialogOpen(true)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await reportPost({ postId, reason, detail })
      if (res.ok) {
        setDone(true)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          aria-label="投稿の操作"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
            <button
              type="button"
              onClick={openDialog}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Flag className="h-4 w-4" />
              通報する
            </button>
          </div>
        )}
      </div>

      {dialogOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDialogOpen(false)
            }}
          >
            <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">投稿を通報</h2>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  aria-label="閉じる"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {done ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-pretty text-sm text-muted-foreground">
                    通報を受け付けました。ご協力ありがとうございます。運営が内容を確認します。
                  </p>
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="mt-2 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
                  <p className="text-pretty text-sm text-muted-foreground">
                    落ち着いた対話の場を守るために、気になる投稿を運営に知らせてください。
                  </p>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-medium text-foreground">理由</legend>
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
                          reason === r
                            ? "border-primary bg-secondary text-secondary-foreground"
                            : "border-border text-foreground hover:bg-muted",
                        )}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-primary"
                        />
                        {r}
                      </label>
                    ))}
                  </fieldset>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">補足（任意）</span>
                    <textarea
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      rows={3}
                      placeholder="状況を簡単に添えてください。"
                      className="resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                  </label>

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDialogOpen(false)}
                      className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      やめる
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isPending ? "送信中…" : "通報する"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
