"use client"

import { MessageSquare, Clock, AlertTriangle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Task, TaskPriority, TaskType } from "@/lib/mock-data"
import { users } from "@/lib/mock-data"
import { toast } from "sonner"

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-secondary text-secondary-foreground border-border",
  medium: "bg-[oklch(0.46_0.17_252/0.1)] text-primary border-primary/30",
  high: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
}

const typeStyles: Record<TaskType, { label: string; className: string }> = {
  story: { label: "Story", className: "bg-[oklch(0.46_0.17_252/0.1)] text-primary border-primary/20" },
  task: { label: "Task", className: "bg-secondary text-secondary-foreground border-border" },
  bug: { label: "Bug", className: "bg-destructive/10 text-destructive border-destructive/20" },
  epic: { label: "Epic", className: "bg-[oklch(0.6_0.16_295/0.1)] text-[oklch(0.45_0.16_295)] border-[oklch(0.6_0.16_295/0.3)]" },
}

interface TaskCardProps {
  task: Task
  compact?: boolean
  className?: string
}

export function TaskCard({ task, compact = false, className }: TaskCardProps) {
  const assignee = users.find((u) => u.id === task.assigneeId)
  const type = typeStyles[task.type]

  return (
    <div
      onClick={() => toast.info(`Task: ${task.title}`)}
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group",
        task.isBlocked && "border-l-2 border-l-destructive",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={cn("text-xs px-1.5 py-0", type.className)}>
            {type.label}
          </Badge>
          <Badge variant="outline" className={cn("text-xs px-1.5 py-0 capitalize", priorityStyles[task.priority])}>
            {task.priority}
          </Badge>
          {task.isBlocked && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">
              Blocked
            </Badge>
          )}
        </div>
        <span className="text-xs font-semibold text-muted-foreground shrink-0">{task.storyPoints} pts</span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </p>

      {compact ? null : (
        <>
          {task.isBlocked && task.blockerReason && (
            <div className="flex items-start gap-1.5 mb-2 p-2 bg-destructive/5 rounded text-xs text-destructive">
              <AlertTriangle className="size-3 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{task.blockerReason}</span>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {task.loggedHours}h
          </span>
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" />
              {task.comments}
            </span>
          )}
        </div>
        {assignee && (
          <Avatar className="size-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
