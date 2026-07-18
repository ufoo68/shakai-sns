"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShakaiLogo } from "@/components/shakai-logo"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      setError(
        error.message === "Invalid email or password"
          ? "メールアドレスまたはパスワードが正しくありません。"
          : (error.message ?? "問題が発生しました。もう一度お試しください。"),
      )
      return
    }

    router.push("/feed")
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="shakai ホーム">
            <ShakaiLogo className="text-2xl" />
          </Link>
          <h1 className="mt-6 text-balance font-display text-xl font-bold tracking-tight text-foreground">
            {isSignUp ? "アカウントをつくる" : "おかえりなさい"}
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {isSignUp
              ? "社会について、落ち着いて語り合う場所へ。"
              : "考えたことの続きを、また here から。"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">表示名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="なまえ"
                  className="h-11 text-base"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="8文字以上"
                className="h-11 text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full text-base">
              {loading ? "処理中…" : isSignUp ? "はじめる" : "ログイン"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "すでにアカウントをお持ちですか? " : "アカウントをお持ちでないですか? "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {isSignUp ? "ログイン" : "新規登録"}
          </Link>
        </p>
      </div>
    </main>
  )
}
