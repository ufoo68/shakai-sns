import { cn } from "@/lib/utils"

type AvatarProps = {
  name: string
  src?: string | null
  className?: string
}

// 落ち着いた青緑系の淡い背景をハンドル名から決定する
const TINTS = [
  "bg-[oklch(0.93_0.03_205)] text-[oklch(0.42_0.06_205)]",
  "bg-[oklch(0.93_0.03_235)] text-[oklch(0.42_0.06_235)]",
  "bg-[oklch(0.93_0.03_170)] text-[oklch(0.42_0.06_170)]",
  "bg-[oklch(0.94_0.025_255)] text-[oklch(0.42_0.06_255)]",
]

function initials(name: string) {
  const trimmed = name.trim()
  // 日本語名は先頭1文字、英字名はイニシャル
  if (/^[\x00-\x7F]+$/.test(trimmed)) {
    return trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("")
  }
  return trimmed[0] ?? "?"
}

export function Avatar({ name, src, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={`${name}のアバター`}
        className={cn("inline-block shrink-0 select-none rounded-full object-cover", className)}
      />
    )
  }

  const tint = TINTS[name.charCodeAt(0) % TINTS.length]
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold",
        tint,
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
