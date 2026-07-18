"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { toggleFollow, type SuggestedUser } from "@/lib/actions/profile"

function FollowButton({ user, isAuthed }: { user: SuggestedUser; isAuthed: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [following, setFollowing] = useState(user.followedByMe)

  function onClick() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    setFollowing((v) => !v)
    startTransition(async () => {
      await toggleFollow(user.userId)
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        following
          ? "border-border bg-secondary text-secondary-foreground"
          : "border-border text-foreground hover:bg-muted",
      )}
    >
      {following ? "フォロー中" : "フォロー"}
    </button>
  )
}

export function FollowSuggestions({ users, isAuthed }: { users: SuggestedUser[]; isAuthed: boolean }) {
  if (users.length === 0) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-bold text-foreground">気になる人</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {users.map((u) => (
          <li key={u.userId} className="flex items-center gap-3">
            <Link href={`/u/${u.handle}`} className="shrink-0">
              <Avatar name={u.name} className="h-9 w-9 text-xs" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/u/${u.handle}`} className="block truncate text-sm font-medium text-foreground hover:underline">
                {u.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {u.interests.length > 0 ? u.interests.join("・") : `@${u.handle}`}
              </p>
            </div>
            <FollowButton user={u} isAuthed={isAuthed} />
          </li>
        ))}
      </ul>
    </section>
  )
}
