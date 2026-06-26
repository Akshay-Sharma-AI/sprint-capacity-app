"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  Clock,
  Plus,
  Loader2,
  ChevronRight,
  Star,
  Bug,
  BookOpen,
  Zap,
  X,
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import type { TaskPriority, TaskType, TaskStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Column definitions ──────────────────────────────────────────────────────

const COLUMNS: { key: TaskStatus | "blocked"; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "border-t-slate-400" },
  { key: "in-progress", label: "In Progress", color: "border-t-blue-500" },
  { key: "in-review", label: "In Review", color: "border-t-violet-500" },
  { key: "done", label: "Done", color: "border-t-emerald-500" },
  { key: "blocked", label: "Blocked", color: "border-t-red-500" },
]

// ── Priority config ─────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { dot: string; badge: string; label: string }> = {
  critical: { dot: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Critical" },
  high:     { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "High" },
  medium:   { dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Medium" },
  low:      { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Low" },
}

// ── Type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<TaskType, { icon: React.ReactNode; badge: string; label: string }> = {
  story: { icon: <BookOpen className="size-3" />, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Story" },
  task:  { icon: <Star className="size-3" />,     badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Task" },
  bug:   { icon: <Bug className="size-3" />,       badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Bug" },
  epic:  { icon: <Zap className="size-3" />,       badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Epic" },
}

// ── Status options for dropdown ─────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
]

// ── Inline add-task form ────────────────────────────────────────────────────

interface AddTaskFormProps {
  columnStatus: TaskStatus
  sprintId: string | null
  projectId: string | null
  onClose: () => void
}

function AddTaskForm({ columnStatus, sprintId, projectId, onClose }: AddTaskFormProps) {
  const { createTask, currentUserId } = useAppContext()
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !projectId) return
    setSaving(true)
    try {
      await createTask({
        projectId,
        sprintId,
        title: title.trim(),
        description: "",
        type: "task",
        priority,
        status: columnStatus,
        assigneeId: currentUserId || "",
        storyPoints: 0,
        estimatedHours: 0,
        loggedHours: 0,
        remainingHours: 0,
        dueDate: "",
        isBlocked: false,
        blockerReason: "",
        comments: 0,
        labels: [],
      })
      toast.success("Task created")
      onClose()
    } catch {
      toast.error("Failed to create task")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-2 mb-2 rounded-lg border border-primary/40 bg-card p-3 shadow-sm">
      <Input
        autoFocus
        placeholder="Task title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="h-7 text-xs mb-2"
      />
      <div className="flex items-center gap-2">
        <Select value={priority} onValueChange={v => setPriority(v as TaskPriority)}>
          <SelectTrigger className="h-6 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["critical", "high", "medium", "low"] as TaskPriority[]).map(p => (
              <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" className="h-6 text-xs px-2" disabled={!title.trim() || saving}>
          {saving ? <Loader2 className="size-3 animate-spin" /> : "Add"}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-3" />
        </Button>
      </div>
    </form>
  )
}

// ── Task detail sheet ───────────────────────────────────────────────────────

interface TaskSheetProps {
  taskId: string | null
  onClose: () => void
}

function TaskSheet({ taskId, onClose }: TaskSheetProps) {
  const { tasks, users, updateTask } = useAppContext()
  const task = tasks.find(t => t.id === taskId)
  const assignee = task ? users.find(u => u.id === task.assigneeId) : null
  const [updating, setUpdating] = useState(false)

  if (!task) return null

  const priority = PRIORITY_CONFIG[task.priority]
  const type = TYPE_CONFIG[task.type]

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return
    setUpdating(true)
    try {
      await updateTask(task.id, { status, isBlocked: status === "blocked" ? true : false })
      toast.success("Status updated")
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  async function handlePriorityChange(p: TaskPriority) {
    if (!task) return
    setUpdating(true)
    try {
      await updateTask(task.id, { priority: p })
      toast.success("Priority updated")
    } catch {
      toast.error("Failed to update priority")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Sheet open={!!taskId} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-[420px] sm:w-[520px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded", type.badge)}>
              {type.icon} {type.label}
            </span>
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded", priority.badge)}>
              <span className={cn("size-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
            {task.isBlocked && (
              <Badge variant="destructive" className="text-xs h-5">Blocked</Badge>
            )}
          </div>
          <SheetTitle className="text-base leading-snug text-left">{task.title}</SheetTitle>
          {task.description && (
            <SheetDescription className="text-sm text-left">{task.description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={task.isBlocked ? "blocked" : task.status}
              onValueChange={v => handleStatusChange(v as TaskStatus)}
              disabled={updating}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                ))}
                <SelectItem value="blocked" className="text-xs text-destructive">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <Select
              value={task.priority}
              onValueChange={v => handlePriorityChange(v as TaskPriority)}
              disabled={updating}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["critical", "high", "medium", "low"] as TaskPriority[]).map(p => (
                  <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground">Assignee</Label>
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>

          {/* Story points */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground">Story Points</Label>
            <span className="text-xs font-medium">{task.storyPoints || "—"}</span>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground">Hours</Label>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">Est: <span className="text-foreground font-medium">{task.estimatedHours}h</span></span>
              <span className="text-muted-foreground">Logged: <span className="text-foreground font-medium">{task.loggedHours}h</span></span>
            </div>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}

          {/* Blocker */}
          {task.isBlocked && task.blockerReason && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-3.5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-destructive mb-0.5">Blocker</p>
                  <p className="text-xs text-destructive/80">{task.blockerReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function SprintBoardContent() {
  const { tasks, users, sprints, activeSprintId, setActiveSprintId, loading } = useAppContext()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null)

  // Determine displayed sprint
  const displayedSprintId = activeSprintId
  const activeSprint = sprints.find(s => s.id === displayedSprintId)

  // Filter tasks for this sprint (or all if no sprint selected)
  const sprintTasks = displayedSprintId
    ? tasks.filter(t => t.sprintId === displayedSprintId)
    : tasks

  const getColumnTasks = (colKey: string) => {
    if (colKey === "blocked") return sprintTasks.filter(t => t.isBlocked)
    return sprintTasks.filter(t => t.status === colKey && !t.isBlocked)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading sprint board…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Sprint selector bar */}
      {sprints.length > 1 && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/60 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">Sprint:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sprints.map(sprint => (
              <button
                key={sprint.id}
                onClick={() => setActiveSprintId(sprint.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  sprint.id === displayedSprintId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {sprint.name}
                {sprint.status === "active" && (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
          {activeSprint && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {new Date(activeSprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              <ChevronRight className="size-3" />
              {new Date(activeSprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
      )}

      {/* Board columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.key)
            const isAddingHere = addingToColumn === col.key
            const colStatus = col.key === "blocked" ? "blocked" : col.key as TaskStatus

            return (
              <div
                key={col.key}
                className={cn(
                  "flex flex-col w-72 shrink-0 rounded-xl border-t-2 bg-muted/30 border border-border overflow-hidden",
                  col.color
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-card/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 min-w-[18px] justify-center"
                    >
                      {colTasks.length}
                    </Badge>
                  </div>
                  {col.key !== "blocked" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-foreground"
                      onClick={() => setAddingToColumn(isAddingHere ? null : col.key)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  )}
                </div>

                {/* Add task inline form */}
                {isAddingHere && col.key !== "blocked" && (
                  <AddTaskForm
                    columnStatus={colStatus === "blocked" ? "todo" : colStatus}
                    sprintId={displayedSprintId}
                    projectId={activeSprint?.projectId ?? (sprints[0]?.projectId ?? null)}
                    onClose={() => setAddingToColumn(null)}
                  />
                )}

                {/* Task cards */}
                <ScrollArea className="flex-1 px-2 py-2">
                  <div className="space-y-2 pb-2">
                    {colTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="size-9 rounded-lg bg-border/60 flex items-center justify-center mb-2">
                          <Plus className="size-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">No tasks</p>
                        {col.key !== "blocked" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 text-xs"
                            onClick={() => setAddingToColumn(col.key)}
                          >
                            Add task
                          </Button>
                        )}
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const assignee = users.find(u => u.id === task.assigneeId)
                        const priority = PRIORITY_CONFIG[task.priority]
                        const type = TYPE_CONFIG[task.type]

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={cn(
                              "group bg-card rounded-lg border border-border p-3 cursor-pointer",
                              "hover:border-primary/40 hover:shadow-md transition-all",
                              task.isBlocked && "border-l-2 border-l-destructive"
                            )}
                          >
                            {/* Type + priority row */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                type.badge
                              )}>
                                {type.icon}
                                {type.label}
                              </span>
                              <div className="ml-auto flex items-center gap-1">
                                <span className={cn("size-1.5 rounded-full", priority.dot)} />
                                <span className="text-[10px] text-muted-foreground">{priority.label}</span>
                              </div>
                            </div>

                            {/* Title */}
                            <p className="text-xs font-medium text-foreground leading-snug mb-2.5 line-clamp-2">
                              {task.title}
                            </p>

                            {/* Blocker reason */}
                            {task.isBlocked && task.blockerReason && (
                              <div className="flex items-start gap-1.5 mb-2.5 p-1.5 bg-destructive/5 rounded text-xs text-destructive">
                                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-1 text-[10px]">{task.blockerReason}</span>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                {task.storyPoints > 0 && (
                                  <span className="font-semibold text-foreground/70">{task.storyPoints}pt</span>
                                )}
                                {task.loggedHours > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="size-2.5" />
                                    {task.loggedHours}h
                                  </span>
                                )}
                              </div>
                              {assignee && (
                                <Avatar className="size-5 ring-1 ring-border">
                                  <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                              )}
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

      {/* Task detail sheet */}
      <TaskSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  )
}
