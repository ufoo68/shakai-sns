"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PenLine, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { GENRES, DIVISIONS, FORMS } from "@/lib/data"
import { createPost } from "@/lib/actions/posts"

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

export function PostComposer({
  isAuthed,
  variant = "header",
}: {
  isAuthed: boolean
  variant?: "header" | "block"
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [genre, setGenre] = useState<string>(GENRES[3])
  const [division, setDivision] = useState<string>(DIVISIONS[0])
  const [form, setForm] = useState<string>(FORMS[0])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  function openComposer() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    setOpen(true)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createPost({ genre, division, form, title, body })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setTitle("")
      setBody("")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={openComposer}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <PenLine className="h-4 w-4" />
          <span className="hidden sm:inline">投稿する</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openComposer}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left text-muted-foreground transition-colors hover:border-primary/30"
        >
          <PenLine className="h-5 w-5 shrink-0 text-primary" />
          <span>学んだこと、考えたことを共有する…</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="新しい投稿"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">投稿を書く</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="ジャンル">
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass}>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="区分">
                  <select value={division} onChange={(e) => setDivision(e.target.value)} className={selectClass}>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="形態">
                  <select value={form} onChange={(e) => setForm(e.target.value)} className={selectClass}>
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="考えのタイトル"
                  maxLength={120}
                  className="h-11 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </Field>

              <Field label="本文">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="学んだこと・考えたことを、落ち着いて書いてみましょう。"
                  rows={7}
                  className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </Field>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                  {isPending ? "投稿中…" : "投稿する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
