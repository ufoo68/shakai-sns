import { PostsTable } from "@/components/admin/posts-table"
import { getAdminPosts } from "@/lib/actions/admin"

export default async function AdminPostsPage() {
  const posts = await getAdminPosts()

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold tracking-tight">投稿</h2>
        <p className="mt-1 text-sm text-muted-foreground">全 {posts.length} 件。不適切な投稿を削除できます。</p>
      </div>
      <PostsTable posts={posts} />
    </div>
  )
}
