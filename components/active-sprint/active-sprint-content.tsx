"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SprintHealthBadge } from "@/components/sprint-health-badge"
import { TaskCard } from "@/components/task-card"
import {
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Flag,
  Timer,
  ListTodo,
  Zap,
  Ban,
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type SprintHealth = "on-track" | "at-risk" | "delayed"

function computeHealth(
  progressPct: number,
  startDate: string,
  endDate: string
): SprintHealth {
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const totalMs = end - start
  const elapsedMs = now - start
  const timeElapsedPct = totalMs > 0 ? Math.round((elapsedMs / totalMs) * 100) : 0

  // If we're ahead or at pace
  if (progressPct >= timeElapsedPct - 10) return "on-track"
  // Lagging 10–30%
  if (progressPct >= timeElapsedPct - 30) return "at-risk"
  return "delayed"
}

const statusGroups = [
  { key: "todo", label: "To Do", icon: ListTodo, color: "text-muted-foreground" },
  { key: "in-progress", label: "In Progress", icon: Loader2, color: "text-primary" },
  { key: "in-review", label: "In Review", icon: Zap, color: "text-[oklch(0.5_0.16_80)]" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-[oklch(0.42_0.15_148)]" },
] as const

export function ActiveSprintContent() {
  const { sprints, tasks, users, capacities, activeSprintId, updateTask, updateSprint } =
    useAppContext()

  const [completingSprintId, setCompletingSprintId] = useState<string | null>(null)
  const [resolvingTaskId, setResolvingTaskId] = useState<string | null>(null)
  const [daysLeft, setDaysLeft] = useState(0)

  const activeSprint = sprints.find((s) => s.id === activeSprintId)

  useEffect(() => {
    if (!activeSprint) return
    const days = Math.ceil(
      (new Date(activeSprint.endDate).getTime() - Date.now()) / 86400000
    )
    setDaysLeft(days)
  }, [activeSprint?.endDate])

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!activeSprint) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-sm space-y-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Flag className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">No Active Sprint</h2>
            <p className="text-sm text-muted-foreground mt-1">
              There is no sprint running right now. Head to the{" "}
              <span className="font-medium text-foreground">Backlog</span> to create a sprint
              and set it to <span className="font-medium text-foreground">active</span>, or
              start an existing sprint from the sprint planning view.
            </p>
          </div>
          <Button variant="outline" onClick={() => toast.info("Go to Backlog to create a sprint")}>
            Go to Backlog
          </Button>
        </div>
      </div>
    )
  }

  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id)
  const blockedTasks = sprintTasks.filter((t) => t.isBlocked)
  const doneTasks = sprintTasks.filter((t) => t.status === "done")
  const inProgressTasks = sprintTasks.filter((t) => t.status === "in-progress" && !t.isBlocked)
  const totalLogged = sprintTasks.reduce((acc, t) => acc + t.loggedHours, 0)

  const progressPct =
    activeSprint.committedStoryPoints > 0
      ? Math.round(
          (activeSprint.completedStoryPoints / activeSprint.committedStoryPoints) * 100
        )
      : 0

  const health = computeHealth(progressPct, activeSprint.startDate, activeSprint.endDate)

  const sprintCapacities = capacities.filter((c) => c.sprintId === activeSprint.id)
  const totalAvail = sprintCapacities.reduce((acc, c) => acc + c.totalAvailableHours, 0)

  async function handleCompleteSprint() {
    setCompletingSprintId(activeSprint.id)
    try {
      await updateSprint(activeSprint.id, { status: "completed" })
      toast.success(`Sprint "${activeSprint.name}" marked as completed.`)
    } catch {
      toast.error("Failed to complete sprint. Please try again.")
    } finally {
      setCompletingSprintId(null)
    }
  }

  async function handleResolveBlocker(taskId: string) {
    setResolvingTaskId(taskId)
    try {
      await updateTask(taskId, { isBlocked: false, blockerReason: "" })
      toast.success("Blocker resolved.")
    } catch {
      toast.error("Failed to resolve blocker.")
    } finally {
      setResolvingTaskId(null)
    }
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">

        {/* ── Sprint header ────────────────────────────────────────────────── */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-foreground">{activeSprint.name}</h2>
                  <SprintHealthBadge
                    health={
                      health === "delayed"
                        ? "delayed"
                        : health === "at-risk"
                        ? "at-risk"
                        : "on-track"
                    }
                  />
                </div>

                {activeSprint.goal && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Target className="size-3.5 shrink-0" />
                    <span className="italic">{activeSprint.goal}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {new Date(activeSprint.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" — "}
                    {new Date(activeSprint.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Timer className="size-3.5 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        daysLeft <= 1
                          ? "border-destructive/40 text-destructive bg-destructive/5"
                          : daysLeft <= 3
                          ? "border-[oklch(0.74_0.16_80/0.4)] text-[oklch(0.5_0.16_80)] bg-[oklch(0.74_0.16_80/0.05)]"
                          : ""
                      )}
                    >
                      {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Ends today"}
                    </Badge>
                  </div>

                  {totalAvail > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {sprintCapacities.length} member{sprintCapacities.length !== 1 ? "s" : ""} ·{" "}
                      {totalAvail}h capacity
                    </div>
                  )}
                </div>
              </div>

              {/* Story point summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Committed", value: activeSprint.committedStoryPoints },
                  { label: "Completed", value: activeSprint.completedStoryPoints, highlight: true },
                  {
                    label: "Remaining",
                    value: Math.max(
                      0,
                      activeSprint.committedStoryPoints - activeSprint.completedStoryPoints
                    ),
                  },
                ].map((s) => (
                  <div key={s.label} className={cn("space-y-0.5", s.highlight && "text-primary")}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                    <p className="text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sprint Progress</span>
                <span className="font-medium text-foreground">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>

            {/* Complete Sprint */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompleteSprint}
                disabled={completingSprintId === activeSprint.id}
                className="text-xs"
              >
                {completingSprintId === activeSprint.id ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Completing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3 mr-1.5" />
                    Complete Sprint
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── 4 KPI cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Tasks Done",
              value: doneTasks.length,
              icon: CheckCircle2,
              color: "text-[oklch(0.42_0.15_148)]",
            },
            {
              label: "In Progress",
              value: inProgressTasks.length,
              icon: Loader2,
              color: "text-primary",
            },
            {
              label: "Blocked",
              value: blockedTasks.length,
              icon: Ban,
              color: "text-destructive",
            },
            {
              label: "Hours Logged",
              value: `${totalLogged}h`,
              icon: Clock,
              color: "text-muted-foreground",
            },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3">
              <div className="flex items-center gap-2">
                <kpi.icon className={cn("size-4 shrink-0", kpi.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Blockers section ─────────────────────────────────────────────── */}
        {blockedTasks.length > 0 && (
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                Blockers ({blockedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockedTasks.map((t) => {
                const assignee = users.find((u) => u.id === t.assigneeId)
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10"
                  >
                    <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      {t.blockerReason && (
                        <p className="text-xs text-muted-foreground mt-0.5">{t.blockerReason}</p>
                      )}
                    </div>
                    {assignee && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {assignee.name.split(" ")[0]}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      disabled={resolvingTaskId === t.id}
                      onClick={() => handleResolveBlocker(t.id)}
                    >
                      {resolvingTaskId === t.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Mark Resolved"
                      )}
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* ── Tasks by status ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          {statusGroups.map(({ key, label, icon: Icon, color }) => {
            const groupTasks = sprintTasks.filter(
              (t) => t.status === key && !t.isBlocked
            )
            if (groupTasks.length === 0) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn("size-4", color)} />
                  <h3 className={cn("text-sm font-semibold", color)}>{label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {groupTasks.length}
                  </Badge>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupTasks.map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
                </div>
              </div>
            )
          })}

          {sprintTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks assigned to this sprint yet.</p>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
