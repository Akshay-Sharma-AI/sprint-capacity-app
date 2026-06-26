"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  RotateCcw,
  PlayCircle,
  MessageSquare,
  Tag,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { tasks, projects, sprints, type Task, type TaskStatus, type TaskPriority } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Simulated current user = u1 (Sarah Chen)
const MY_USER_ID = "u1"

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

function TaskRow({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [hours, setHours] = useState("")
  const [isOverdue, setIsOverdue] = useState(false)
  const project = projects.find((p) => p.id === task.projectId)
  const sprint = task.sprintId ? sprints.find((s) => s.id === task.sprintId) : null
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon
  const progressPct = task.estimatedHours > 0
    ? Math.round((task.loggedHours / task.estimatedHours) * 100)
    : 0

  useEffect(() => {
    const due = new Date(task.dueDate)
    setIsOverdue(due < new Date() && task.status !== "done")
  }, [task.dueDate, task.status])

  return (
    <>
      <div
        className={cn(
          "border border-border rounded-lg overflow-hidden transition-all",
          task.isBlocked && "border-destructive/30 bg-destructive/2"
        )}
      >
        {/* Main row */}
        <div className="flex items-start gap-3 p-3.5">
          <StatusIcon className={cn("size-4 mt-0.5 shrink-0", task.status === "done" ? "text-success" : task.status === "blocked" ? "text-destructive" : "text-primary")} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{project?.name}</span>
                  {sprint && (
                    <Badge variant="outline" className="text-xs h-4 px-1.5 text-muted-foreground">
                      {sprint.name}
                    </Badge>
                  )}
                  {task.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs h-4 px-1.5">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Right side badges */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  <StatusIcon className="size-3" />
                  {status.label}
                </Badge>
                <span className={cn("text-xs font-medium flex items-center gap-1", priority.className)}>
                  <span className={cn("size-1.5 rounded-full inline-block", priority.dotClass)} />
                  {priority.label}
                </span>
                <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                  <Calendar className="size-3" />
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  {task.comments}
                </span>
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
            {task.isBlocked && (
              <div className="flex items-start gap-1.5 mt-2 text-xs text-destructive bg-destructive/5 rounded px-2 py-1.5">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                <span>{task.blockerReason}</span>
              </div>
            )}
          </div>

          {/* Expand/actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setLogOpen(true)}
            >
              <Clock className="size-3" data-icon="inline-start" />
              Log
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
              <p className={cn("font-semibold", task.remainingHours === 0 ? "text-success" : "")}>{task.remainingHours}h</p>
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
              <Label>Hours Worked</Label>
              <Input
                type="number"
                placeholder="e.g. 2.5"
                min="0"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="What did you work on?" className="text-sm resize-none h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                if (hours) {
                  toast.success(`Logged ${hours}h on "${task.title.substring(0, 30)}..."`)
                  setHours("")
                  setLogOpen(false)
                }
              }}
            >
              Save Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function MyTasksContent() {
  const myTasks = tasks.filter((t) => t.assigneeId === MY_USER_ID)
  const sprintTasks = myTasks.filter((t) => t.sprintId !== null)
  const backlogTasks = myTasks.filter((t) => t.sprintId === null)
  const activeTasks = myTasks.filter((t) => ["in-progress", "in-review", "qa"].includes(t.status))
  const blockedTasks = myTasks.filter((t) => t.isBlocked)
  const doneTasks = myTasks.filter((t) => t.status === "done")
  const totalLogged = myTasks.reduce((s, t) => s + t.loggedHours, 0)
  const totalEstimated = myTasks.reduce((s, t) => s + t.estimatedHours, 0)

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Tasks", value: myTasks.length, sub: "Across all projects" },
            { label: "In Progress", value: activeTasks.length, sub: "Active now", className: "text-primary" },
            { label: "Blocked", value: blockedTasks.length, sub: "Need attention", className: blockedTasks.length > 0 ? "text-destructive" : "" },
            { label: "Completed", value: doneTasks.length, sub: `${Math.round((doneTasks.length / myTasks.length) * 100)}% done rate`, className: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.className ?? "text-foreground")}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Hours summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">Sprint Progress</p>
            <span className="text-xs text-muted-foreground">
              {totalLogged}h logged / {totalEstimated}h estimated
            </span>
          </div>
          <Progress
            value={totalEstimated > 0 ? Math.round((totalLogged / totalEstimated) * 100) : 0}
            className="h-2"
          />
        </Card>

        <Tabs defaultValue="sprint">
          <TabsList className="h-8">
            <TabsTrigger value="sprint" className="text-xs">
              In Sprint <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{sprintTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="backlog" className="text-xs">
              Backlog <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{backlogTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="done" className="text-xs">
              Done <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{doneTasks.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sprint" className="mt-4 space-y-2">
            {sprintTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No sprint tasks assigned to you.</p>
              </Card>
            ) : (
              sprintTasks.map((task) => <TaskRow key={task.id} task={task} />)
            )}
          </TabsContent>

          <TabsContent value="backlog" className="mt-4 space-y-2">
            {backlogTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No backlog items assigned to you.</p>
              </Card>
            ) : (
              backlogTasks.map((task) => <TaskRow key={task.id} task={task} />)
            )}
          </TabsContent>

          <TabsContent value="done" className="mt-4 space-y-2">
            {doneTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
              </Card>
            ) : (
              doneTasks.map((task) => <TaskRow key={task.id} task={task} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
