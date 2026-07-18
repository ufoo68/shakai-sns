import { SiteHeader } from "@/components/site-header"
import { InquiryForm } from "@/components/inquiry-form"
import { getSession } from "@/lib/session"

export const metadata = {
  title: "お問い合わせ | shakai",
  description: "shakai 運営へのお問い合わせフォームです。",
}

export default async function ContactPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance">お問い合わせ</h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            不具合の報告や機能のご要望、アカウントに関するご相談など、運営へのご連絡はこちらから。
          </p>
        </div>

        <InquiryForm defaultName={session?.user?.name ?? ""} defaultEmail={session?.user?.email ?? ""} />
      </main>
    </div>
  )
}
