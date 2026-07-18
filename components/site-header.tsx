"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Bell, LogOut, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShakaiLogo } from "@/components/shakai-logo"
import { PostComposer } from "@/components/post-composer"
import { Avatar } from "@/components/avatar"
import { authClient } from "@/lib/auth-client"

const NAV = [
  { href: "/feed", label: "フィード" },
  { href: "/profile", label: "プロフィール" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const isAuthed = !!session?.user
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function onSignOut() {
    await authClient.signOut()
    setMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="shakai ホーム" className="shrink-0">
          <ShakaiLogo className="text-base" />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="探す"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>

          {isAuthed && (
            <button
              type="button"
              aria-label="通知"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </button>
          )}

          <div className="ml-1">
            <PostComposer isAuthed={isAuthed} variant="header" />
          </div>

          {isPending ? null : isAuthed ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="アカウントメニュー"
                className="flex items-center rounded-full"
              >
                <Avatar name={session.user.name} className="h-9 w-9 text-xs" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{session.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4" />
                    プロフィール
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="ml-1 inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
