"use client"

import { useState, useEffect, useRef, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { PostCard } from "@/components/post-card"
import { search, type SearchResult } from "@/lib/actions/search"
import type { SuggestedUser } from "@/lib/actions/profile"

function UserRow({ u }: { u: SuggestedUser }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Link href={`/u/${u.handle}`} className="shrink-0">
        <Avatar name={u.name} className="h-11 w-11 text-sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/u/${u.handle}`} className="block truncate font-medium text-foreground hover:underline">
          {u.name}
        </Link>
        <p className="truncate text-sm text-muted-foreground">@{u.handle}</p>
        {u.interests.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{u.interests.join("・")}</p>
        )}
      </div>
    </li>
  )
}

export function SearchView({
  isAuthed,
  currentUserId = null,
}: {
  isAuthed: boolean
  currentUserId?: string | null
}) {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get("q") ?? ""

  const [query, setQuery] = useState(initial)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResult(null)
      setHasSearched(false)
      return
    }
    startTransition(async () => {
      const res = await search(trimmed)
      setResult(res)
      setHasSearched(true)
    })
  }, [])

  // 入力のデバウンス検索 + URL同期
  useEffect(() => {
    const t = setTimeout(() => {
      runSearch(query)
      const sp = new URLSearchParams()
      if (query.trim()) sp.set("q", query.trim())
      router.replace(sp.toString() ? `/search?${sp.toString()}` : "/search", { scroll: false })
    }, 350)
    return () => clearTimeout(t)
  }, [query, runSearch, router])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const postCount = result?.posts.length ?? 0
  const userCount = result?.users.length ?? 0

  return (
    <div>
      <Link
        href="/feed"
        className="-ml-2 mb-3 inline-flex h-11 items-center gap-1.5 rounded-full px-2 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        フィードに戻る
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">探す</h1>
      <p className="mt-1 text-muted-foreground text-pretty">投稿や、考えている人を見つける。</p>

      {/* 検索ボックス */}
      <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-card px-4 focus-within:border-primary">
        <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード・ユーザー名・ハンドルで検索"
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            aria-label="クリア"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 結果 */}
      <div className="mt-6">
        {!hasSearched && !isPending && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground text-pretty">
            気になるテーマや人を検索してみましょう。
          </p>
        )}

        {isPending && !result && <p className="py-8 text-center text-sm text-muted-foreground">検索中…</p>}

        {hasSearched && result && postCount === 0 && userCount === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground text-pretty">
            「{query.trim()}」に一致する投稿・ユーザーは見つかりませんでした。
          </p>
        )}

        {result && userCount > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold text-foreground">ユーザー（{userCount}）</h2>
            <ul className="flex flex-col gap-3">
              {result.users.map((u) => (
                <UserRow key={u.userId} u={u} />
              ))}
            </ul>
          </section>
        )}

        {result && postCount > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-foreground">投稿（{postCount}）</h2>
            <div className="flex flex-col gap-4">
              {result.posts.map((p) => (
                <PostCard key={p.id} post={p} isAuthed={isAuthed} currentUserId={currentUserId} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
