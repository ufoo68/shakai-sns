import Link from "next/link"
import { Users, Flag, MessageSquare, FileText, ArrowRight } from "lucide-react"
import { getAdminStats } from "@/lib/actions/admin"

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const cards = [
    { label: "ユーザー", value: stats.users, href: "/admin/users", icon: Users, note: "登録者の総数" },
    { label: "投稿", value: stats.posts, href: "/admin/posts", icon: FileText, note: "公開中の投稿" },
    { label: "未対応の通報", value: stats.openReports, href: "/admin/reports", icon: Flag, note: "確認待ち", alert: stats.openReports > 0 },
    { label: "未対応の問い合わせ", value: stats.openInquiries, href: "/admin/inquiries", icon: MessageSquare, note: "返信待ち", alert: stats.openInquiries > 0 },
  ]

  return (
    <div>
      <div className="mb-5 lg:hidden">
        <h1 className="font-display text-2xl font-bold tracking-tight">ダッシュボード</h1>
      </div>
      <p className="mb-5 text-pretty leading-relaxed text-muted-foreground">
        shakai の状態をひと目で。数字の裏側にある対話を、落ち着いて見守りましょう。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{c.label}</span>
                {c.alert && <span className="ml-1 h-2 w-2 rounded-full bg-destructive" aria-label="未対応あり" />}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="font-display text-4xl font-bold tabular-nums text-foreground">{c.value}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <span className="mt-1 text-xs text-muted-foreground">{c.note}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
