"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PostCard } from "@/components/post-card"
import { GENRES, posts, type Genre } from "@/lib/data"

const FILTERS = ["すべて", ...GENRES] as const

export function FeedView() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("すべて")

  const filtered =
    active === "すべて" ? posts : posts.filter((p) => p.genre === (active as Genre))

  return (
    <div>
      {/* ジャンルフィルター */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-b-none sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            このジャンルの投稿はまだありません。
          </p>
        )}
      </div>
    </div>
  )
}
