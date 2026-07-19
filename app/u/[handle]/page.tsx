import { notFound } from "next/navigation"
import { ProfileScreen } from "@/components/profile-screen"
import { getProfileByHandle } from "@/lib/actions/profile"
import { getPostsByUser } from "@/lib/actions/posts"
import { getBooksByUser } from "@/lib/actions/books"
import { getOptionalUserId } from "@/lib/session"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const profile = await getProfileByHandle(handle)
  if (!profile) notFound()

  const [posts, books, me] = await Promise.all([
    getPostsByUser(profile.userId),
    getBooksByUser(profile.userId),
    getOptionalUserId(),
  ])

  // 自分自身のハンドルなら /profile に相当する編集可能ビューになる
  return <ProfileScreen profile={profile} posts={posts} books={books} isAuthed={!!me} currentUserId={me} />
}
