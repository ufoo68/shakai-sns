"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Shield, ShieldOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { setUserRole } from "@/lib/actions/admin"
import type { AdminUserView } from "@/lib/data"

export function UsersTable({ users }: { users: AdminUserView[] }) {
  const [rows, setRows] = useState(users)
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  function toggleRole(u: AdminUserView) {
    const next = u.role === "admin" ? "user" : "admin"
    setBusyId(u.id)
    setRows((rs) => rs.map((r) => (r.id === u.id ? { ...r, role: next } : r)))
    startTransition(async () => {
      try {
        await setUserRole(u.id, next)
      } catch {
        // 失敗したら元に戻す
        setRows((rs) => rs.map((r) => (r.id === u.id ? { ...r, role: u.role } : r)))
      } finally {
        setBusyId(null)
      }
    })
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((u) => (
        <li
          key={u.id}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <Link href={`/u/${u.handle}`} className="shrink-0">
            <Avatar name={u.name} className="h-10 w-10 text-sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/u/${u.handle}`} className="truncate font-medium text-foreground hover:underline">
                {u.name}
              </Link>
              {u.role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  管理者
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              @{u.handle} ・ {u.email}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {u.postCount} 投稿 ・ 登録 {u.createdAt}
            </p>
          </div>

          {u.isMe ? (
            <span className="shrink-0 text-xs text-muted-foreground">あなた</span>
          ) : (
            <button
              type="button"
              onClick={() => toggleRole(u)}
              disabled={isPending && busyId === u.id}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                u.role === "admin"
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "bg-secondary text-secondary-foreground hover:opacity-90",
              )}
            >
              {u.role === "admin" ? (
                <>
                  <ShieldOff className="h-3.5 w-3.5" />
                  権限を外す
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  管理者にする
                </>
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
