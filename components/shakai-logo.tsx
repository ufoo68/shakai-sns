import { cn } from "@/lib/utils"

type ShakaiLogoProps = {
  className?: string
  showMark?: boolean
}

/** shakai の公式ブランドロゴ画像。 */
export function ShakaiLogo({ className }: ShakaiLogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src="/shakai-icon.png"
        alt="shakai"
        className="h-12 w-12 object-cover mix-blend-multiply"
      />
    </span>
  )
}
