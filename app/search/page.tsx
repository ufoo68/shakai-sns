import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SearchView } from "@/components/search-view"
import { getOptionalUserId } from "@/lib/session"

export default async function SearchPage() {
  const me = await getOptionalUserId()
  const isAuthed = !!me

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Suspense fallback={<p className="py-8 text-center text-sm text-muted-foreground">読み込み中…</p>}>
          <SearchView isAuthed={isAuthed} currentUserId={me} />
        </Suspense>
      </main>
    </div>
  )
}
