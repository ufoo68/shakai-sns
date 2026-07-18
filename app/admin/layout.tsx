import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { AdminNav } from "@/components/admin/admin-nav"
import { isAdmin } from "@/lib/session"

export const metadata = {
  title: "管理メニュー | shakai",
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // 管理者以外はフィードへ戻す
  if (!(await isAdmin())) redirect("/feed")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="lg:sticky lg:top-20">
            <div className="mb-3 hidden lg:block">
              <h1 className="font-display text-lg font-bold tracking-tight">管理メニュー</h1>
              <p className="mt-1 text-xs text-muted-foreground">場を落ち着いて保つための道具です。</p>
            </div>
            <AdminNav />
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  )
}
