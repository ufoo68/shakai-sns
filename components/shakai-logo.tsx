import { cn } from "@/lib/utils"

type ShakaiLogoProps = {
  className?: string
  imageClassName?: string
  cropFrame?: boolean
}

/** shakai の公式ブランドロゴ画像。 */
export function ShakaiLogo({ className, imageClassName, cropFrame = false }: ShakaiLogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", cropFrame && "overflow-hidden", className)}>
      <img
        src="/shakai-icon.png"
        alt="shakai"
        className={cn(
          "h-12 w-12 object-cover mix-blend-multiply",
          cropFrame && "scale-[1.6]",
          imageClassName,
        )}
      />
    </span>
  )
}
