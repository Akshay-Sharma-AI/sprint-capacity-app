"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import { tasks, users, type TaskPriority, type TaskType } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const columns = [
  { key: "todo", label: "To Do", className: "border-t-border" },
  { key: "in-progress", label: "In Progress", className: "border-t-primary" },
  { key: "in-review", label: "Code Review", className: "border-t-[oklch(0.62_0.15_180)]" },
  { key: "qa", label: "QA Testing", className: "border-t-[oklch(0.74_0.16_80)]" },
  { key: "done", label: "Done", className: "border-t-[oklch(0.62_0.15_148)]" },
  { key: "blocked", label: "Blocked", className: "border-t-destructive" },
] as const

const priorityDots: Record<TaskPriority, string> = {
  low: "bg-muted-foreground",
  medium: "bg-primary",
  high: "bg-[oklch(0.74_0.16_80)]",
  critical: "bg-destructive",
}

const typeBadge: Record<TaskType, { label: string; className: string }> = {
  story: { label: "S", className: "bg-primary/10 text-primary" },
  task: { label: "T", className: "bg-muted text-muted-foreground" },
  bug: { label: "B", className: "bg-destructive/10 text-destructive" },
  epic: { label: "E", className: "bg-[oklch(0.6_0.16_295/0.1)] text-[oklch(0.45_0.16_295)]" },
}

export function SprintBoardContent() {
  const sprintTasks = tasks.filter((t) => t.sprintId === "s1")

  const getColumnTasks = (colKey: string) => {
    if (colKey === "blocked") return sprintTasks.filter((t) => t.isBlocked)
    return sprintTasks.filter((t) => t.status === colKey && !t.isBlocked)
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-x-auto">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {columns.map((col) => {
            const colTasks = getColumnTasks(col.key)
            return (
              <div
                key={col.key}
                className={cn(
                  "flex flex-col w-72 shrink-0 rounded-xl border-t-2 bg-muted/40 border border-border overflow-hidden",
                  col.className
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-card/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">{colTasks.length}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => toast.info(`Add task to ${col.label}`)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Cards */}
                <ScrollArea className="flex-1 px-2 py-2">
                  <div className="space-y-2 pb-2">
                    {colTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="size-10 rounded-lg bg-border flex items-center justify-center mb-2">
                          <Plus className="size-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">No tasks here</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 text-xs"
                          onClick={() => toast.info(`Add task to ${col.label}`)}
                        >
                          Add a task
                        </Button>
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const assignee = users.find((u) => u.id === task.assigneeId)
                        const type = typeBadge[task.type]
                        return (
                          <div
                            key={task.id}
                            onClick={() => toast.info(task.title)}
                            className={cn(
                              "bg-card rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all",
                              task.isBlocked && "border-l-2 border-l-destructive"
                            )}
                          >
                            {/* Type + priority */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", type.className)}>
                                {type.label}
                              </span>
                              <span className={cn("size-2 rounded-full ml-auto", priorityDots[task.priority])} />
                              <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                            </div>

                            {/* Title */}
                            <p className="text-xs font-medium text-foreground leading-snug mb-2 line-clamp-2">
                              {task.title}
                            </p>

                            {/* Blocker */}
                            {task.isBlocked && (
                              <div className="flex items-start gap-1.5 mb-2 p-1.5 bg-destructive/5 rounded text-xs text-destructive">
                                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{task.blockerReason}</span>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-1 mt-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="size-3" />
                                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="size-3" />
                                  {task.loggedHours}h
                                </span>
                                {task.comments > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <MessageSquare className="size-3" />
                                    {task.comments}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">{task.storyPoints}p</span>
                                {assignee && (
                                  <Avatar className="size-5">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                      {assignee.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
