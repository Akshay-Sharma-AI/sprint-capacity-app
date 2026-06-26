import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SprintHealth = "on-track" | "at-risk" | "delayed"

interface SprintHealthBadgeProps {
  health: SprintHealth
  className?: string
}

const healthConfig: Record<SprintHealth, { label: string; className: string }> = {
  "on-track": {
    label: "On Track",
    className: "bg-[oklch(0.62_0.15_148/0.1)] text-[oklch(0.42_0.15_148)] border-[oklch(0.62_0.15_148/0.3)]",
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]",
  },
  delayed: {
    label: "Delayed",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
}

export function SprintHealthBadge({ health, className }: SprintHealthBadgeProps) {
  const config = healthConfig[health]
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium gap-1.5", config.className, className)}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  )
}
