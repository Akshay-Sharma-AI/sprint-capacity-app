"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Loader2,
  Users,
  Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"

const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  "in-progress": "#3b82f6",
  "in-review": "#a855f7",
  qa: "#f59e0b",
  done: "#22c55e",
  blocked: "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  qa: "QA",
  done: "Done",
  blocked: "Blocked",
}

export function DashboardContent() {
  const {
    tasks,
    users,
    sprints,
    capacities,
    projects,
    activeSprintId,
    setActiveSprintId,
    loading,
  } = useAppContext()

  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  const activeSprint =
    sprints.find((s) => s.id === activeSprintId) || sprints[0]

  const sprintTasks = activeSprint
    ? tasks.filter((t) => t.sprintId === activeSprint.id)
    : []

  const doneTasks = sprintTasks.filter((t) => t.status === "done")
  const blockedTasks = sprintTasks.filter((t) => t.isBlocked)

  const progressPct = activeSprint?.committedStoryPoints
    ? Math.round(
        (activeSprint.completedStoryPoints /
          activeSprint.committedStoryPoints) *
          100
      )
    : 0

  const totalAvailable = capacities.reduce(
    (sum, c) => sum + (c.totalAvailableHours ?? 0),
    0
  )
  const totalAllocated = capacities.reduce(
    (sum, c) => sum + (c.allocatedHours ?? 0),
    0
  )

  // Task counts by status for bar chart
  const statusCounts = Object.keys(STATUS_LABELS).map((status) => ({
    status: STATUS_LABELS[status],
    count: sprintTasks.filter((t) => t.status === status).length,
    key: status,
  }))

  useEffect(() => {
    if (!activeSprint) return
    const end = new Date(activeSprint.endDate)
    const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
    setDaysRemaining(days)
  }, [activeSprint?.endDate])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!activeSprint) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <FolderKanban className="size-12 text-muted-foreground" />
        <div>
          <p className="text-base font-semibold">No sprints found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a sprint to start tracking your team&apos;s work.
          </p>
        </div>
        <Button asChild>
          <Link href="/sprints">Create a Sprint</Link>
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">

        {/* Sprint header + selector */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-foreground">
                {activeSprint.name}
              </h2>
              <Badge variant="outline" className="text-xs capitalize">
                {activeSprint.status}
              </Badge>
            </div>
            {activeSprint.goal && (
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                {activeSprint.goal}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>
                {new Date(activeSprint.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {" — "}
                {new Date(activeSprint.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Badge variant="secondary" className="text-xs ml-1">
                {daysRemaining > 0
                  ? `${daysRemaining}d remaining`
                  : daysRemaining === 0
                  ? "Ends today"
                  : "Sprint ended"}
              </Badge>
            </div>
          </div>

          {sprints.length > 1 && (
            <div className="w-52 shrink-0">
              <Select
                value={activeSprint.id}
                onValueChange={(val) => setActiveSprintId(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Sprint Progress */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="size-3.5" />
                <span className="text-xs font-medium">Sprint Progress</span>
              </div>
              <p className="text-2xl font-bold">{progressPct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeSprint.completedStoryPoints} /{" "}
                {activeSprint.committedStoryPoints} pts
              </p>
              <Progress value={progressPct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          {/* Tasks Done */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="size-3.5 text-green-500" />
                <span className="text-xs font-medium">Tasks Done</span>
              </div>
              <p className="text-2xl font-bold">{doneTasks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                of {sprintTasks.length} total tasks
              </p>
            </CardContent>
          </Card>

          {/* Blocked Tasks */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle
                  className={`size-3.5 ${
                    blockedTasks.length > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-xs font-medium">Blocked Tasks</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  blockedTasks.length > 0 ? "text-destructive" : ""
                }`}
              >
                {blockedTasks.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {blockedTasks.length > 0 ? "Needs attention" : "No blockers"}
              </p>
            </CardContent>
          </Card>

          {/* Days Remaining */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="size-3.5" />
                <span className="text-xs font-medium">Days Remaining</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  daysRemaining <= 0
                    ? "text-muted-foreground"
                    : daysRemaining <= 2
                    ? "text-destructive"
                    : ""
                }`}
              >
                {Math.max(0, daysRemaining)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Until{" "}
                {new Date(activeSprint.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts + Blockers row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart: tasks by status */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Tasks by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sprintTasks.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                  No tasks in this sprint yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={statusCounts}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusCounts.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={STATUS_COLORS[entry.key] ?? "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Blockers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                Active Blockers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No blockers — great work!
                </p>
              ) : (
                blockedTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assigneeId)
                  return (
                    <div
                      key={t.id}
                      className="flex items-start gap-2.5 p-2.5 bg-destructive/5 rounded-lg border border-destructive/15"
                    >
                      <Avatar className="size-7 mt-0.5 shrink-0">
                        <AvatarFallback className="text-xs bg-destructive/10 text-destructive font-medium">
                          {assignee?.initials ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {assignee?.name && (
                            <span className="font-medium text-foreground">
                              {assignee.name}:{" "}
                            </span>
                          )}
                          {t.blockerReason ?? "No reason provided"}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <Button asChild variant="outline" size="sm" className="w-full text-xs mt-2">
                <Link href="/sprint-board">View Sprint Board</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Capacity Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4" />
              Team Capacity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="text-xl font-bold">{totalAllocated}h</p>
                <p className="text-xs text-muted-foreground">Allocated</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{totalAvailable}h</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold ${
                    totalAllocated > totalAvailable ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {totalAvailable > 0
                    ? `${Math.round((totalAllocated / totalAvailable) * 100)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Utilization</p>
              </div>
            </div>
            <Progress
              value={
                totalAvailable > 0
                  ? Math.min(100, Math.round((totalAllocated / totalAvailable) * 100))
                  : 0
              }
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {totalAvailable - totalAllocated > 0
                ? `${totalAvailable - totalAllocated}h unallocated`
                : totalAllocated > totalAvailable
                ? `${totalAllocated - totalAvailable}h over capacity`
                : "Fully allocated"}
            </p>
          </CardContent>
        </Card>

      </div>
    </ScrollArea>
  )
}
