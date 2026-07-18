import { cn } from "@/lib/utils"

type ShakaiLogoProps = {
  className?: string
  showMark?: boolean
}

/**
 * shakai ワードマーク。
 * 小さなシンボルは「異なる視点が重なり合う=対話」を抽象化した
 * ふたつの弧。学習サービス的なモチーフ(本・木など)は使わない。
 */
export function ShakaiLogo({ className, showMark = true }: ShakaiLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showMark && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="h-[1.1em] w-[1.1em] text-primary"
        >
          <circle
            cx="9"
            cy="12"
            r="6.25"
            stroke="currentColor"
            strokeWidth="1.75"
            opacity="0.55"
          />
          <circle
            cx="15"
            cy="12"
            r="6.25"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      )}
      <span className="font-display text-[1.35em] font-bold lowercase tracking-tight text-foreground">
        shakai
      </span>
    </span>
  )
}
