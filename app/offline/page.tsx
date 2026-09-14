import Link from "next/link"
import { RotateCw } from "lucide-react"
import { ShakaiLogo } from "@/components/shakai-logo"

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md text-center">
        <ShakaiLogo className="justify-center text-3xl" />
        <h1 className="mt-8 font-display text-2xl font-bold tracking-tight">
          オフラインです
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          ネットワーク接続が戻ったら、ページを再読み込みしてください。
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RotateCw className="h-4 w-4" />
          再読み込みする
        </Link>
      </section>
    </main>
  )
}
