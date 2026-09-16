import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal-page-layout"

export const metadata: Metadata = {
  title: "プライバシーポリシー | shakai",
  description: "shakaiにおける個人情報の取扱いについてご案内します。",
}

const sections = [
  { title: "1. 取得する情報", paragraphs: ["shakaiは、アカウント登録時の氏名、メールアドレス、プロフィール情報、投稿・リアクションなどの利用情報を取得します。お問い合わせの際には、内容と返信に必要な情報も取得します。"] },
  { title: "2. 利用目的", paragraphs: ["取得した情報は、サービスの提供・本人確認・不正利用の防止・機能改善・お問い合わせへの対応・重要なお知らせの送信のために利用します。"] },
  { title: "3. 第三者提供・委託", paragraphs: ["運営は、法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しません。サービス運営に必要な業務を外部事業者へ委託する場合は、適切な安全管理を求めます。"] },
  { title: "4. Cookieとアクセス解析", paragraphs: ["shakaiは、ログイン状態の維持や利用状況の把握のためにCookieなどの技術を使用することがあります。ブラウザの設定でCookieを無効にできますが、一部機能が利用できなくなる場合があります。"] },
  { title: "5. 安全管理", paragraphs: ["運営は、個人情報への不正アクセス、紛失、漏えいなどを防ぐため、合理的な安全管理措置を講じます。"] },
  { title: "6. 開示・訂正・削除", paragraphs: ["ご本人から、保有する個人情報の開示、訂正、利用停止、削除などの請求があった場合は、本人確認のうえ、法令に従って対応します。"] },
  { title: "7. ポリシーの変更", paragraphs: ["運営は、法令やサービス内容の変更に応じて本ポリシーを改定することがあります。重要な変更はサービス上でお知らせします。"] },
  { title: "8. お問い合わせ", paragraphs: ["個人情報の取扱いに関するお問い合わせは、サポートページのお問い合わせ窓口からご連絡ください。"] },
]

export default function PrivacyPage() {
  return <LegalPageLayout eyebrow="PRIVACY POLICY" title="プライバシーポリシー" description="shakaiにおける個人情報の取扱いについてご案内します。" updatedAt="2026年9月16日" sections={sections} />
}
