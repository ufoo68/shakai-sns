"use client"

import { useState, useTransition } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { INQUIRY_CATEGORIES } from "@/lib/data"
import { submitInquiry } from "@/lib/actions/support"

export function InquiryForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string
  defaultEmail?: string
}) {
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [category, setCategory] = useState<string>(INQUIRY_CATEGORIES[0])
  const [message, setMessage] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await submitInquiry({ name, email, category, message })
      if (res.ok) {
        setDone(true)
        setMessage("")
      } else {
        setError(res.error)
      }
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="font-display text-lg font-bold text-foreground">送信しました</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          お問い合わせを受け付けました。運営が内容を確認し、必要に応じてご連絡します。
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-2 inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          続けて問い合わせる
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">お名前</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前"
            className="h-11 rounded-xl border border-border bg-background px-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl border border-border bg-background px-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">種類</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-3.5 text-base text-foreground outline-none focus:border-primary"
        >
          {INQUIRY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">内容</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="お困りのことやご要望を、落ち着いてお書きください。"
          className="resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
        )}
      >
        {isPending ? "送信中…" : "送信する"}
      </button>
    </form>
  )
}
