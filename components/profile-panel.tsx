"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { GENRES, type ProfileView } from "@/lib/data"
import { toggleFollow, updateProfile } from "@/lib/actions/profile"

export function ProfilePanel({ profile, isAuthed }: { profile: ProfileView; isAuthed: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [following, setFollowing] = useState(profile.followedByMe)
  const [editing, setEditing] = useState(false)

  const [bio, setBio] = useState(profile.bio)
  const [thought, setThought] = useState(profile.currentThought)
  const [interests, setInterests] = useState<string[]>(profile.interests)

  function onFollow() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    setFollowing((v) => !v)
    startTransition(async () => {
      await toggleFollow(profile.userId)
    })
  }

  function toggleInterest(g: string) {
    setInterests((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateProfile({ bio, currentThought: thought, interests })
      setEditing(false)
      router.refresh()
    })
  }

  return (
    <>
      {/* プロフィールヘッダー */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar name={profile.name} className="h-16 w-16 text-xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>
          {profile.isMe ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              編集
            </button>
          ) : (
            <button
              type="button"
              onClick={onFollow}
              disabled={isPending}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors",
                following
                  ? "border border-border bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {following ? "フォロー中" : "フォロー"}
            </button>
          )}
        </div>

        {profile.bio ? (
          <p className="mt-4 whitespace-pre-line text-pretty leading-relaxed text-foreground">{profile.bio}</p>
        ) : profile.isMe ? (
          <p className="mt-4 text-sm text-muted-foreground">
            自己紹介はまだありません。「編集」から、あなたの関心を書いてみましょう。
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground tabular-nums">{profile.postCount}</span> 投稿
          </span>
          <span>
            <span className="font-semibold text-foreground tabular-nums">{profile.followingCount}</span> フォロー
          </span>
          <span>
            <span className="font-semibold text-foreground tabular-nums">{profile.followerCount}</span> フォロワー
          </span>
        </div>
      </section>

      {/* いま考えていること — 「何について考えている人か」を最上位に */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">いま考えていること</h2>
        </div>
        {profile.currentThought ? (
          <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-foreground">{profile.currentThought}</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {profile.isMe ? "いま向き合っている問いを書いてみましょう。" : "まだ記入されていません。"}
          </p>
        )}

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">興味のあるジャンル</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.interests.length > 0 ? (
            profile.interests.map((g) => (
              <span key={g} className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                {g}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">未設定</span>
          )}
        </div>
      </section>

      {/* 編集モーダル */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="プロフィールを編集"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(false)
          }}
        >
          <div className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">プロフィールを編集</h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSave} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">自己紹介</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="どんなことに関心がありますか?"
                  className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">いま考えていること</span>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="いま向き合っている問いは?"
                  className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">興味のあるジャンル</span>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const on = interests.includes(g)
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleInterest(g)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  やめる
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "保存中…" : "保存する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
