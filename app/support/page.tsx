import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, LifeBuoy } from "lucide-react"
import { LegalPageLayout } from "@/components/legal-page-layout"

export const metadata: Metadata = {
  title: "サポート | shakai",
  description: "shakaiの使い方や困ったときのサポートをご案内します。",
}

const sections = [
  { title: "アカウントについて", paragraphs: ["ログインできない場合は、登録したメールアドレスをご確認ください。解決しない場合は、お問い合わせ時に表示されるエラーメッセージを添えてご連絡ください。"] },
  { title: "投稿・通報について", paragraphs: ["投稿の削除や編集は、投稿のメニューから操作できます。利用規約に違反する投稿を見つけた場合は、投稿の通報機能をご利用ください。"] },
  { title: "よくある質問", paragraphs: ["Q. 退会したい場合はどうすればよいですか？", "A. お問い合わせフォームから、退会希望であることと登録メールアドレスをご連絡ください。本人確認のうえ対応します。", "Q. 不具合を報告したいです。", "A. 発生した画面、操作手順、利用端末などをできるだけ詳しくお知らせください。"] },
]

export default function SupportPage() {
  return (
    <LegalPageLayout
      eyebrow="SUPPORT"
      title="サポート"
      description="shakaiの使い方や、お困りのときのご案内です。"
      updatedAt="2026年9月16日"
      sections={sections}
      footer={<SupportContactLink />}
    />
  )
}

export function SupportContactLink() {
  return (
    <Link href="/contact" className="mx-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
      <LifeBuoy className="size-4" aria-hidden="true" />
      お問い合わせフォームへ
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}
