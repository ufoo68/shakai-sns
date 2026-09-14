"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Shield, ShieldOff, Snowflake, Trash2, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { adminDeleteUser, setUserRole, setUserStatus } from "@/lib/actions/admin"
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

  function toggleStatus(u: AdminUserView) {
    const next = u.status === "frozen" ? "active" : "frozen"
    setBusyId(u.id)
    setRows((rs) => rs.map((r) => (r.id === u.id ? { ...r, status: next } : r)))
    startTransition(async () => {
      try {
        await setUserStatus(u.id, next)
      } catch {
        setRows((rs) => rs.map((r) => (r.id === u.id ? { ...r, status: u.status } : r)))
      } finally {
        setBusyId(null)
      }
    })
  }

  function deleteUser(u: AdminUserView) {
    if (!window.confirm(`${u.name} を削除します。投稿、フォロー、お気に入りなどの関連データも削除されます。`)) {
      return
    }
    setBusyId(u.id)
    setRows((rs) => rs.filter((r) => r.id !== u.id))
    startTransition(async () => {
      try {
        await adminDeleteUser(u.id)
      } catch {
        setRows((rs) => [u, ...rs].sort((a, b) => users.findIndex((x) => x.id === a.id) - users.findIndex((x) => x.id === b.id)))
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
          className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
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
              {u.status === "frozen" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  <Snowflake className="h-3 w-3" />
                  凍結中
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
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
              <button
                type="button"
                onClick={() => toggleRole(u)}
                disabled={isPending && busyId === u.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
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
              <button
                type="button"
                onClick={() => toggleStatus(u)}
                disabled={isPending && busyId === u.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                  u.status === "frozen"
                    ? "bg-secondary text-secondary-foreground hover:opacity-90"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {u.status === "frozen" ? (
                  <>
                    <Undo2 className="h-3.5 w-3.5" />
                    解除
                  </>
                ) : (
                  <>
                    <Snowflake className="h-3.5 w-3.5" />
                    凍結
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => deleteUser(u)}
                disabled={isPending && busyId === u.id}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                削除
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
