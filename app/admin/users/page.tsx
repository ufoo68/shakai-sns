import { UsersTable } from "@/components/admin/users-table"
import { getAdminUsers } from "@/lib/actions/admin"

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold tracking-tight">ユーザー</h2>
        <p className="mt-1 text-sm text-muted-foreground">登録者は {users.length} 名。管理者権限の付与・剥奪ができます。</p>
      </div>
      <UsersTable users={users} />
    </div>
  )
}
