"use client"

import { useState, useRef, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react"
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  type NotificationView,
  type NotificationType,
} from "@/lib/actions/notifications"

const TYPE_ICON: Record<NotificationType, typeof Heart> = {
  empathy: Heart,
  comment: MessageCircle,
  follow: UserPlus,
}

function label(n: NotificationView) {
  switch (n.type) {
    case "empathy":
      return "があなたの投稿に共感しました"
    case "comment":
      return "があなたの投稿にコメントしました"
    case "follow":
      return "があなたをフォローしました"
  }
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotificationView[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await getUnreadCount())
    } catch {
      // 未ログインなどは無視
    }
  }, [])

  // 初回と一定間隔で未読数を更新する
  useEffect(() => {
    refreshCount()
    const t = setInterval(refreshCount, 30000)
    return () => clearInterval(t)
  }, [refreshCount])

  // 外側クリックで閉じる
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try {
        const list = await getNotifications()
        setItems(list)
        // 開いたら既読にする
        if (unread > 0) {
          startTransition(async () => {
            await markAllNotificationsRead()
            setUnread(0)
            setItems((prev) => prev.map((i) => ({ ...i, read: true })))
          })
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={unread > 0 ? `通知 ${unread}件の未読` : "通知"}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">通知</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">読み込み中…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground text-pretty">
                まだ通知はありません。
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {items.map((n) => {
                  const Icon = TYPE_ICON[n.type]
                  const goToProfile = n.type === "follow"
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          if (goToProfile) router.push(`/u/${n.actor.handle}`)
                          else router.push("/feed")
                        }}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                          n.read ? "" : "bg-accent/40"
                        }`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-sm leading-relaxed text-foreground">
                            <span className="font-medium">{n.actor.name}</span>
                            {label(n)}
                          </span>
                          {n.postTitle && (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              「{n.postTitle}」
                            </span>
                          )}
                          <span className="mt-0.5 block text-xs text-muted-foreground">{n.createdAt}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
