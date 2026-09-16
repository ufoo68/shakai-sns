import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

type LegalSection = {
  title: string
  paragraphs: string[]
  items?: string[]
}

type LegalPageLayoutProps = {
  eyebrow: string
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
  footer?: ReactNode
}

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
  footer,
}: LegalPageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          shakai ホームへ戻る
        </Link>

        <header className="flex flex-col gap-3 border-b border-border pb-8">
          <p className="text-sm font-semibold tracking-wide text-primary">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground">最終更新日：{updatedAt}</p>
        </header>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-7 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        {footer}
      </main>
    </>
  )
}
