import { ReportsTable } from "@/components/admin/reports-table"
import { getAdminReports } from "@/lib/actions/admin"

export default async function AdminReportsPage() {
  const reports = await getAdminReports()
  const open = reports.filter((r) => r.status === "open").length

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold tracking-tight">通報</h2>
        <p className="mt-1 text-sm text-muted-foreground">未対応 {open} 件。内容を確認し、対応を選んでください。</p>
      </div>
      <ReportsTable reports={reports} />
    </div>
  )
}
