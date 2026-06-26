"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertTriangle, CheckCircle2, MinusCircle, Clock } from "lucide-react"
import { users, tasks, capacities, type AvailabilityStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const availabilityConfig: Record<AvailabilityStatus, { label: string; className: string; icon: React.ElementType }> = {
  available: { label: "Available", className: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  partial: { label: "Partial", className: "bg-warning/10 text-warning-foreground border-warning/30", icon: MinusCircle },
  overloaded: { label: "Overloaded", className: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
  "on-leave": { label: "On Leave", className: "bg-muted text-muted-foreground border-border", icon: Clock },
}

function checkIsOverdue(dueDate: string, status: string): boolean {
  const due = new Date(dueDate)
  return due < new Date() && status !== "done"
}

export function WorkloadContent() {
  const [overdueMap, setOverdueMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const map: Record<string, boolean> = {}
    tasks.forEach((task) => {
      map[task.id] = checkIsOverdue(task.dueDate, task.status)
    })
    setOverdueMap(map)
  }, [])

  // Build per-user workload from tasks
  const workloadData = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id)
    const capacity = capacities.find((c) => c.userId === user.id)
    const activeTasks = userTasks.filter((t) => ["in-progress", "in-review", "qa"].includes(t.status))
    const doneTasks = userTasks.filter((t) => t.status === "done")
    const blockedTasks = userTasks.filter((t) => t.isBlocked)
    const totalLoggedHours = userTasks.reduce((sum, t) => sum + t.loggedHours, 0)
    const totalRemainingHours = userTasks.reduce((sum, t) => sum + t.remainingHours, 0)

    return {
      user,
      capacity,
      allTasks: userTasks,
      activeTasks,
      doneTasks,
      blockedTasks,
      totalLoggedHours,
      totalRemainingHours,
      taskCount: userTasks.length,
    }
  }).filter((d) => d.taskCount > 0 || d.capacity)

  // Chart data for stacked bar
  const chartData = workloadData
    .filter((d) => d.capacity)
    .map((d) => ({
      name: d.user.name.split(" ")[0],
      logged: d.totalLoggedHours,
      remaining: d.totalRemainingHours,
      available: Math.max(0, (d.capacity?.totalAvailableHours ?? 0) - d.totalLoggedHours - d.totalRemainingHours),
    }))

  const teamStats = {
    totalTasks: tasks.length,
    activeTasks: tasks.filter((t) => t.status === "in-progress").length,
    blockedTasks: tasks.filter((t) => t.isBlocked).length,
    avgUtil: Math.round(capacities.reduce((s, c) => s + c.utilizationPercentage, 0) / capacities.length),
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Tasks", value: teamStats.totalTasks, sub: "Across all sprints" },
            { label: "In Progress", value: teamStats.activeTasks, sub: "Active right now" },
            { label: "Blocked", value: teamStats.blockedTasks, sub: "Need attention", highlight: true },
            { label: "Avg Utilization", value: `${teamStats.avgUtil}%`, sub: "Team average" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.highlight && Number(s.value) > 0 ? "text-destructive" : "text-foreground")}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="cards">
          <TabsList className="h-8">
            <TabsTrigger value="cards" className="text-xs">Member View</TabsTrigger>
            <TabsTrigger value="chart" className="text-xs">Hours Breakdown</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">Task List</TabsTrigger>
          </TabsList>

          {/* Member cards */}
          <TabsContent value="cards" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workloadData.map(({ user, capacity, activeTasks, doneTasks, blockedTasks, totalLoggedHours, taskCount }) => {
                const avail = availabilityConfig[user.availabilityStatus]
                const AvailIcon = avail.icon
                const util = capacity?.utilizationPercentage ?? 0

                return (
                  <Card key={user.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.team} · {user.role}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs shrink-0", avail.className)}>
                          <AvailIcon className="size-3" />
                          {avail.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1">
                      {/* Utilization bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className={cn(
                            "font-semibold",
                            util > 95 ? "text-destructive" : util > 80 ? "text-warning-foreground" : "text-success"
                          )}>
                            {util}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(util, 100)}
                          className={cn(
                            "h-1.5",
                            util > 95 && "[&>div]:bg-destructive",
                            util > 80 && util <= 95 && "[&>div]:bg-warning",
                          )}
                        />
                      </div>

                      {/* Task counts */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[
                          { label: "Active", value: activeTasks.length, className: "text-primary" },
                          { label: "Done", value: doneTasks.length, className: "text-success" },
                          { label: "Blocked", value: blockedTasks.length, className: blockedTasks.length > 0 ? "text-destructive" : "text-muted-foreground" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center rounded-md bg-muted/50 py-1.5">
                            <p className={cn("text-lg font-bold leading-none", stat.className)}>{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Hours */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                        <span>{totalLoggedHours}h logged</span>
                        <span>{taskCount} tasks total</span>
                        <span>{capacity?.totalAvailableHours ?? 0}h available</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Hours breakdown chart */}
          <TabsContent value="chart" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Hours Breakdown by Team Member</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    logged: { label: "Hours Logged", color: "var(--chart-1)" },
                    remaining: { label: "Hours Remaining", color: "var(--chart-2)" },
                    available: { label: "Unallocated", color: "var(--chart-3)" },
                  }}
                  className="h-72 w-full"
                >
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="logged" stackId="a" fill="var(--chart-1)" />
                    <Bar dataKey="remaining" stackId="a" fill="var(--chart-2)" />
                    <Bar dataKey="available" stackId="a" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task list across all members */}
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Assignee", "Task", "Status", "Priority", "Logged", "Remaining", "Due"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter((t) => t.sprintId !== null).map((task) => {
                      const assignee = users.find((u) => u.id === task.assigneeId)
                      const statusColors: Record<string, string> = {
                        "todo": "bg-muted text-muted-foreground",
                        "in-progress": "bg-primary/10 text-primary",
                        "in-review": "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)]",
                        "qa": "bg-[oklch(0.66_0.15_180/0.1)] text-[oklch(0.4_0.15_180)]",
                        "done": "bg-success/10 text-success",
                        "blocked": "bg-destructive/10 text-destructive",
                      }
                      const priorityColors: Record<string, string> = {
                        "low": "text-muted-foreground",
                        "medium": "text-[oklch(0.5_0.16_80)]",
                        "high": "text-[oklch(0.75_0.18_32)]",
                        "critical": "text-destructive",
                      }
                      const isOverdue = overdueMap[task.id] ?? false

                      return (
                        <tr key={task.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="px-3 py-2.5">
                            {assignee && (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6 shrink-0">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs whitespace-nowrap">{assignee.name.split(" ")[0]}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 max-w-56">
                            <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                            {task.isBlocked && (
                              <p className="text-xs text-destructive mt-0.5 truncate">{task.blockerReason}</p>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant="outline" className={cn("text-xs capitalize", statusColors[task.status])}>
                              {task.status.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className={cn("px-3 py-2.5 text-xs font-medium capitalize", priorityColors[task.priority])}>
                            {task.priority}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{task.loggedHours}h</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{task.remainingHours}h</td>
                          <td className={cn("px-3 py-2.5 text-xs whitespace-nowrap", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
