"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SprintHealthBadge } from "@/components/sprint-health-badge"
import { TaskCard } from "@/components/task-card"
import {
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react"
import { sprints, tasks, users, capacities } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const statusGroups = [
  { key: "todo", label: "To Do", color: "text-muted-foreground" },
  { key: "in-progress", label: "In Progress", color: "text-primary" },
  { key: "in-review", label: "In Review", color: "text-[oklch(0.5_0.16_80)]" },
  { key: "done", label: "Done", color: "text-[oklch(0.42_0.15_148)]" },
  { key: "blocked", label: "Blocked", color: "text-destructive" },
] as const

export function ActiveSprintContent() {
  const [daysLeft, setDaysLeft] = useState(0)

  const sprint = sprints.find((s) => s.status === "active" && s.projectId === "p1")!
  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id)
  const blockedTasks = sprintTasks.filter((t) => t.isBlocked)
  const totalLogged = sprintTasks.reduce((s, t) => s + t.loggedHours, 0)
  const totalEstimated = sprintTasks.reduce((s, t) => s + t.estimatedHours, 0)
  const progressPct = Math.round((sprint.completedStoryPoints / sprint.committedStoryPoints) * 100)
  const sprintCapacities = capacities.filter((c) => c.sprintId === sprint.id)
  const totalAvail = sprintCapacities.reduce((s, c) => s + c.totalAvailableHours, 0)

  useEffect(() => {
    const days = Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / 86400000)
    setDaysLeft(days)
  }, [sprint.endDate])

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Sprint header card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-foreground">{sprint.name}</h2>
                  <SprintHealthBadge health="at-risk" />
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Target className="size-3.5" />
                  <span className="italic">{sprint.goal}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" — "}
                    {new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <Badge variant="outline" className="text-xs">{daysLeft} days left</Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {sprintCapacities.length} team members · {totalAvail}h total capacity
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center lg:text-right">
                {[
                  { label: "Committed", value: sprint.committedStoryPoints, sub: "story points" },
                  { label: "Completed", value: sprint.completedStoryPoints, sub: "story points", highlight: true },
                  { label: "Remaining", value: sprint.committedStoryPoints - sprint.completedStoryPoints, sub: "story points" },
                ].map((s) => (
                  <div key={s.label} className={cn("space-y-0.5", s.highlight && "text-primary")}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                    <p className="text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sprint Progress</span>
                <span className="font-medium text-foreground">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Risks & Blockers */}
        {blockedTasks.length > 0 && (
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                Risks & Blockers ({blockedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockedTasks.map((t) => {
                const assignee = users.find((u) => u.id === t.assigneeId)
                return (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                    <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.blockerReason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{assignee?.name.split(" ")[0]}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => toast.success("Blocker resolved")}
                    >
                      Resolve
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Hours summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Estimated", value: `${totalEstimated}h`, icon: Clock },
            { label: "Hours Logged", value: `${totalLogged}h`, icon: CheckCircle2 },
            { label: "Tasks in Sprint", value: sprintTasks.length, icon: Target },
            { label: "Done", value: sprintTasks.filter(t => t.status === "done").length, icon: CheckCircle2 },
          ].map((m) => (
            <Card key={m.label} className="p-3">
              <div className="flex items-center gap-2">
                <m.icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-bold text-foreground">{m.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tasks by status */}
        <div className="space-y-4">
          {statusGroups.map(({ key, label, color }) => {
            const groupTasks = sprintTasks.filter((t) =>
              key === "blocked" ? t.isBlocked : t.status === key && !t.isBlocked
            )
            if (groupTasks.length === 0) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={cn("text-sm font-semibold", color)}>{label}</h3>
                  <Badge variant="secondary" className="text-xs">{groupTasks.length}</Badge>
                  <Separator className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => toast.info(`${label} tasks`)}
                  >
                    View all <ChevronRight className="size-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
