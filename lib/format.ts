// 投稿日時を落ち着いた相対表現に整形する
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 1000)

  if (diff < 60) return "たった今"
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`

  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
