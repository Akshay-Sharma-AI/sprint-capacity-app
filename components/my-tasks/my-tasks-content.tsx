"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  RotateCcw,
  PlayCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  LogIn,
  ListChecks,
  Inbox,
  CheckCheck,
} from "lucide-react"
import type { Task, TaskStatus, TaskPriority } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAppContext } from "@/context/app-context"

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; className: string }> = {
  "todo": { label: "To Do", icon: Circle, className: "bg-muted text-muted-foreground border-border" },
  "in-progress": { label: "In Progress", icon: PlayCircle, className: "bg-primary/10 text-primary border-primary/30" },
  "in-review": { label: "In Review", icon: RotateCcw, className: "bg-warning/10 text-warning-foreground border-warning/30" },
  "qa": { label: "QA", icon: CheckCircle2, className: "bg-[oklch(0.66_0.15_180/0.1)] text-[oklch(0.4_0.15_180)] border-[oklch(0.66_0.15_180/0.3)]" },
  "done": { label: "Done", icon: CheckCircle2, className: "bg-success/10 text-success border-success/30" },
  "blocked": { label: "Blocked", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/30" },
}

const priorityConfig: Record<TaskPriority, { label: string; className: string; dotClass: string }> = {
  "low": { label: "Low", className: "text-muted-foreground", dotClass: "bg-muted-foreground" },
  "medium": { label: "Medium", className: "text-warning-foreground", dotClass: "bg-warning" },
  "high": { label: "High", className: "text-[oklch(0.75_0.18_32)]", dotClass: "bg-[oklch(0.75_0.18_32)]" },
  "critical": { label: "Critical", className: "text-destructive font-semibold", dotClass: "bg-destructive" },
}

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in-progress", "in-review", "qa", "done", "blocked"]

interface TaskRowProps {
  task: Task
  projects: { id: string; name: string }[]
  sprints: { id: string; name: string }[]
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
}

function TaskRow({ task, projects, sprints, updateTask }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [hoursWorked, setHoursWorked] = useState("")
  const [remainingInput, setRemainingInput] = useState(String(task.remainingHours ?? 0))
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [isOverdue, setIsOverdue] = useState(false)

  const project = projects.find((p) => p.id === task.projectId)
  const sprint = task.sprintId ? sprints.find((s) => s.id === task.sprintId) : null
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon
  const progressPct = task.estimatedHours > 0
    ? Math.min(100, Math.round((task.loggedHours / task.estimatedHours) * 100))
    : 0

  useEffect(() => {
    const due = new Date(task.dueDate)
    setIsOverdue(due < new Date() && task.status !== "done")
  }, [task.dueDate, task.status])

  async function handleStatusChange(newStatus: TaskStatus) {
    try {
      await updateTask(task.id, { status: newStatus })
      toast.success(`Status updated to "${statusConfig[newStatus].label}"`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  async function handleLogHours() {
    const h = parseFloat(hoursWorked)
    if (isNaN(h) || h < 0) {
      toast.error("Enter a valid number of hours")
      return
    }
    setSaving(true)
    try {
      const newLogged = (task.loggedHours ?? 0) + h
      const newRemaining = Math.max(0, parseFloat(remainingInput) || 0)
      await updateTask(task.id, {
        loggedHours: newLogged,
        remainingHours: newRemaining,
      })
      toast.success(`Logged ${h}h on "${task.title.substring(0, 30)}"`)
      setHoursWorked("")
      setNotes("")
      setLogOpen(false)
    } catch {
      toast.error("Failed to log hours")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "border border-border rounded-lg overflow-hidden transition-all",
          task.isBlocked && "border-destructive/30 bg-destructive/[0.02]"
        )}
      >
        {/* Main row */}
        <div className="flex items-start gap-3 p-3.5">
          <StatusIcon
            className={cn(
              "size-4 mt-0.5 shrink-0",
              task.status === "done"
                ? "text-success"
                : task.status === "blocked"
                ? "text-destructive"
                : "text-primary"
            )}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.status === "done" && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{project?.name ?? "—"}</span>
                  {sprint && (
                    <Badge variant="outline" className="text-xs h-4 px-1.5 text-muted-foreground">
                      {sprint.name}
                    </Badge>
                  )}
                  {task.labels?.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs h-4 px-1.5">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {/* Priority badge */}
                <span className={cn("text-xs font-medium flex items-center gap-1", priority.className)}>
                  <span className={cn("size-1.5 rounded-full inline-block", priority.dotClass)} />
                  {priority.label}
                </span>

                {/* Status dropdown */}
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className={cn("h-6 text-xs px-2 border rounded-md w-auto gap-1", status.className)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => {
                      const cfg = statusConfig[s]
                      const Icon = cfg.icon
                      return (
                        <SelectItem key={s} value={s} className="text-xs">
                          <span className="flex items-center gap-1.5">
                            <Icon className="size-3" />
                            {cfg.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Due date */}
                <span
                  className={cn(
                    "text-xs flex items-center gap-1",
                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="size-3" />
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </span>

                {/* Story points */}
                <span className="text-xs text-muted-foreground font-medium">{task.storyPoints} pts</span>
              </div>
            </div>

            {/* Progress bar */}
            {task.status !== "todo" && task.estimatedHours > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progressPct} className="h-1 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {task.loggedHours}h / {task.estimatedHours}h ({progressPct}%)
                </span>
              </div>
            )}

            {/* Blocker warning */}
            {task.isBlocked && task.blockerReason && (
              <div className="flex items-start gap-1.5 mt-2 text-xs text-destructive bg-destructive/5 rounded px-2 py-1.5">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                <span>{task.blockerReason}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setRemainingInput(String(task.remainingHours ?? 0))
                setLogOpen(true)
              }}
            >
              <Clock className="size-3 mr-1" />
              Log Hours
            </Button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-border bg-muted/30 px-3.5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-0.5">Story Points</p>
              <p className="font-semibold">{task.storyPoints} pts</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Est. Hours</p>
              <p className="font-semibold">{task.estimatedHours}h</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Logged</p>
              <p className="font-semibold">{task.loggedHours}h</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Remaining</p>
              <p className={cn("font-semibold", (task.remainingHours ?? 0) === 0 ? "text-success" : "")}>
                {task.remainingHours ?? 0}h
              </p>
            </div>
            {task.description && (
              <div className="col-span-full">
                <p className="text-muted-foreground mb-0.5">Description</p>
                <p className="text-foreground">{task.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log hours dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Log Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground line-clamp-2">{task.title}</p>
            <div className="space-y-1.5">
              <Label htmlFor="hours-worked">Hours Worked</Label>
              <Input
                id="hours-worked"
                type="number"
                placeholder="e.g. 2.5"
                min="0"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="remaining-hours">Remaining Hours</Label>
              <Input
                id="remaining-hours"
                type="number"
                placeholder="e.g. 4"
                min="0"
                step="0.5"
                value={remainingInput}
                onChange={(e) => setRemainingInput(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-notes">Notes (optional)</Label>
              <Textarea
                id="log-notes"
                placeholder="What did you work on?"
                className="text-sm resize-none h-20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLogHours} disabled={saving}>
              {saving ? "Saving…" : "Save Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <Card className="p-10 text-center flex flex-col items-center gap-3">
      <Icon className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </Card>
  )
}

export function MyTasksContent() {
  const { tasks, sprints, projects, currentUserId, updateTask, activeSprintId } = useAppContext()

  // Not logged in
  if (!currentUserId) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <LogIn className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Sign in to see your tasks</p>
        </div>
      </div>
    )
  }

  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId)

  // Tab buckets
  const inSprintTasks = myTasks.filter(
    (t) => t.sprintId === activeSprintId && activeSprintId !== null && t.status !== "done"
  )
  const backlogTasks = myTasks.filter((t) => !t.sprintId)
  const doneTasks = myTasks.filter((t) => t.status === "done")

  // Summary cards
  const openCount = myTasks.filter((t) => t.status !== "done").length
  const inProgressCount = myTasks.filter((t) => t.status === "in-progress").length
  const blockedCount = myTasks.filter((t) => t.isBlocked || t.status === "blocked").length
  const completedThisSprint = myTasks.filter(
    (t) => t.sprintId === activeSprintId && t.status === "done"
  ).length

  const totalLogged = myTasks.reduce((s, t) => s + (t.loggedHours ?? 0), 0)
  const totalEstimated = myTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0)

  const rowProps = { projects, sprints, updateTask }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "My Open Tasks",
              value: openCount,
              sub: "Across all sprints",
              className: "text-foreground",
            },
            {
              label: "In Progress",
              value: inProgressCount,
              sub: "Active now",
              className: "text-primary",
            },
            {
              label: "Blocked",
              value: blockedCount,
              sub: "Need attention",
              className: blockedCount > 0 ? "text-destructive" : "text-foreground",
            },
            {
              label: "Completed This Sprint",
              value: completedThisSprint,
              sub: activeSprintId ? "Current sprint" : "No active sprint",
              className: "text-success",
            },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.className)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Hours progress */}
        {totalEstimated > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Sprint Hour Progress</p>
              <span className="text-xs text-muted-foreground">
                {totalLogged}h logged / {totalEstimated}h estimated
              </span>
            </div>
            <Progress
              value={Math.min(100, Math.round((totalLogged / totalEstimated) * 100))}
              className="h-2"
            />
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="sprint">
          <TabsList className="h-8">
            <TabsTrigger value="sprint" className="text-xs">
              In Sprint
              <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">
                {inSprintTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="backlog" className="text-xs">
              Backlog
              <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">
                {backlogTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="done" className="text-xs">
              Done
              <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">
                {doneTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sprint" className="mt-4 space-y-2">
            {inSprintTasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                message={
                  activeSprintId
                    ? "No active sprint tasks assigned to you."
                    : "No active sprint selected."
                }
              />
            ) : (
              inSprintTasks.map((task) => (
                <TaskRow key={task.id} task={task} {...rowProps} />
              ))
            )}
          </TabsContent>

          <TabsContent value="backlog" className="mt-4 space-y-2">
            {backlogTasks.length === 0 ? (
              <EmptyState icon={Inbox} message="No backlog items assigned to you." />
            ) : (
              backlogTasks.map((task) => (
                <TaskRow key={task.id} task={task} {...rowProps} />
              ))
            )}
          </TabsContent>

          <TabsContent value="done" className="mt-4 space-y-2">
            {doneTasks.length === 0 ? (
              <EmptyState icon={CheckCheck} message="No completed tasks yet." />
            ) : (
              doneTasks.map((task) => (
                <TaskRow key={task.id} task={task} {...rowProps} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
