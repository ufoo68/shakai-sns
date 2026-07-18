import { InquiriesTable } from "@/components/admin/inquiries-table"
import { getAdminInquiries } from "@/lib/actions/admin"

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries()
  const open = inquiries.filter((q) => q.status === "open").length

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold tracking-tight">問い合わせ</h2>
        <p className="mt-1 text-sm text-muted-foreground">未対応 {open} 件。内容を確認し、必要に応じて返信してください。</p>
      </div>
      <InquiriesTable inquiries={inquiries} />
    </div>
  )
}
