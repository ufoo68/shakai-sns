import { redirect } from "next/navigation"
import { ProfileScreen } from "@/components/profile-screen"
import { getMyProfile } from "@/lib/actions/profile"
import { getPostsByUser } from "@/lib/actions/posts"
import { getBooksByUser } from "@/lib/actions/books"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  const profile = await getMyProfile()
  if (!profile) redirect("/sign-in")

  const [posts, books] = await Promise.all([
    getPostsByUser(profile.userId),
    getBooksByUser(profile.userId),
  ])

  return <ProfileScreen profile={profile} posts={posts} books={books} isAuthed />
}
