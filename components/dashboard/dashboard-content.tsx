"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatCard } from "@/components/stat-card"
import { SprintHealthBadge } from "@/components/sprint-health-badge"
import { BurndownChart } from "@/components/dashboard/burndown-chart"
import { CapacityUtilizationChart } from "@/components/dashboard/capacity-utilization-chart"
import { TaskStatusChart } from "@/components/dashboard/task-status-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FolderKanban,
  Zap,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Users,
  TrendingDown,
  Calendar,
  Clock,
} from "lucide-react"
import { sprints, tasks, users, capacities } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DashboardContent() {
  const [daysLeft, setDaysLeft] = useState(0)

  const activeSprint = sprints.find((s) => s.status === "active" && s.projectId === "p1")!
  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id)
  const blockedTasks = sprintTasks.filter((t) => t.isBlocked)
  const doneTasks = sprintTasks.filter((t) => t.status === "done")
  const pendingTasks = sprintTasks.filter((t) => t.status !== "done")
  const pendingPoints = sprintTasks.filter((t) => t.status !== "done").reduce((sum, t) => sum + t.storyPoints, 0)

  const totalAvail = capacities.reduce((s, c) => s + c.totalAvailableHours, 0)
  const totalAlloc = capacities.reduce((s, c) => s + c.allocatedHours, 0)
  const overloaded = capacities.filter((c) => c.status === "overloaded")

  useEffect(() => {
    const endDate = new Date(activeSprint.endDate)
    const days = Math.ceil((endDate.getTime() - Date.now()) / 86400000)
    setDaysLeft(days)
  }, [activeSprint.endDate])

  const progressPct = Math.round((activeSprint.completedStoryPoints / activeSprint.committedStoryPoints) * 100)

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Sprint summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{activeSprint.name}</h2>
              <SprintHealthBadge health="at-risk" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{activeSprint.goal}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>
              {new Date(activeSprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" — "}
              {new Date(activeSprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <Badge variant="outline" className="text-xs">{daysLeft}d left</Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <StatCard
            title="Active Projects"
            value={3}
            icon={FolderKanban}
            variant="primary"
            subtitle="2 on track, 1 at risk"
          />
          <StatCard
            title="Sprint Progress"
            value={`${progressPct}%`}
            icon={Zap}
            variant="primary"
            subtitle={`${activeSprint.completedStoryPoints} / ${activeSprint.committedStoryPoints} pts`}
          />
          <StatCard
            title="Completed Points"
            value={activeSprint.completedStoryPoints}
            icon={CheckCircle2}
            variant="success"
            subtitle="Story points done"
          />
          <StatCard
            title="Pending Points"
            value={pendingPoints}
            icon={Circle}
            variant="warning"
            subtitle={`${pendingTasks.length} tasks remaining`}
          />
          <StatCard
            title="Blocked Tasks"
            value={blockedTasks.length}
            icon={AlertTriangle}
            variant={blockedTasks.length > 0 ? "destructive" : "success"}
            subtitle={blockedTasks.length > 0 ? "Needs attention" : "No blockers"}
          />
        </div>

        {/* Second row KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Capacity"
            value={`${totalAvail}h`}
            icon={Users}
            subtitle="This sprint"
          />
          <StatCard
            title="Allocated Hours"
            value={`${totalAlloc}h`}
            icon={Clock}
            variant="primary"
            subtitle={`${Math.round((totalAlloc / totalAvail) * 100)}% utilized`}
          />
          <StatCard
            title="Remaining Capacity"
            value={`${totalAvail - totalAlloc}h`}
            icon={TrendingDown}
            variant={totalAlloc > totalAvail ? "destructive" : "success"}
            subtitle="Unallocated hours"
          />
          <StatCard
            title="Overloaded Members"
            value={overloaded.length}
            icon={AlertTriangle}
            variant={overloaded.length > 0 ? "warning" : "success"}
            subtitle={overloaded.length > 0 ? "Need rebalancing" : "Everyone balanced"}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <BurndownChart />
          </div>
          <TaskStatusChart />
        </div>

        {/* Capacity + Blockers row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CapacityUtilizationChart />
          </div>

          {/* Blockers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                Active Blockers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.filter((t) => t.isBlocked).map((t) => {
                const assignee = users.find((u) => u.id === t.assigneeId)
                return (
                  <div key={t.id} className="flex items-start gap-2.5 p-2.5 bg-destructive/5 rounded-lg border border-destructive/15">
                    <Avatar className="size-7 mt-0.5 shrink-0">
                      <AvatarFallback className="text-xs bg-destructive/10 text-destructive font-medium">
                        {assignee?.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{t.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.blockerReason}</p>
                    </div>
                  </div>
                )
              })}
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/sprint-board">View Sprint Board</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sprint progress bar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Sprint Velocity — {activeSprint.name}</CardTitle>
              <span className="text-xs text-muted-foreground">{progressPct}% complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPct} className="h-2.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{activeSprint.completedStoryPoints} pts completed</span>
              <span>{activeSprint.committedStoryPoints - activeSprint.completedStoryPoints} pts remaining</span>
              <span>Goal: {activeSprint.committedStoryPoints} pts</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
