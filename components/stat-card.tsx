import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  variant?: "default" | "success" | "warning" | "destructive" | "primary"
  className?: string
}

const variantStyles = {
  default: "border-border",
  success: "border-l-4 border-l-[oklch(0.62_0.15_148)]",
  warning: "border-l-4 border-l-[oklch(0.74_0.16_80)]",
  destructive: "border-l-4 border-l-destructive",
  primary: "border-l-4 border-l-primary",
}

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-[oklch(0.62_0.15_148/0.1)] text-[oklch(0.52_0.15_148)]",
  warning: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.55_0.16_80)]",
  destructive: "bg-destructive/10 text-destructive",
  primary: "bg-primary/10 text-primary",
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  trend.value >= 0 ? "text-[oklch(0.52_0.15_148)]" : "text-destructive"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn("flex items-center justify-center size-9 rounded-lg shrink-0", iconVariantStyles[variant])}>
              <Icon className="size-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
