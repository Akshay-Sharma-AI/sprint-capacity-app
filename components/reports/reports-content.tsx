"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  velocityData,
  capacityTrendData,
  taskStatusData,
  burndownData,
  users,
  tasks,
  capacities,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Build type distribution
const typeDistData = [
  { name: "Story", value: tasks.filter((t) => t.type === "story").length, fill: "var(--chart-1)" },
  { name: "Task", value: tasks.filter((t) => t.type === "task").length, fill: "var(--chart-2)" },
  { name: "Bug", value: tasks.filter((t) => t.type === "bug").length, fill: "var(--chart-5)" },
  { name: "Epic", value: tasks.filter((t) => t.type === "epic").length, fill: "var(--chart-3)" },
]

// Build priority distribution
const priorityData = [
  { name: "Critical", value: tasks.filter((t) => t.priority === "critical").length, fill: "var(--chart-5)" },
  { name: "High", value: tasks.filter((t) => t.priority === "high").length, fill: "var(--chart-4)" },
  { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, fill: "var(--chart-2)" },
  { name: "Low", value: tasks.filter((t) => t.priority === "low").length, fill: "var(--chart-3)" },
]

// Team health radar per member
const radarData = users
  .filter((u) => capacities.find((c) => c.userId === u.id))
  .map((u) => {
    const cap = capacities.find((c) => c.userId === u.id)!
    const userTasks = tasks.filter((t) => t.assigneeId === u.id)
    const donePct = userTasks.length
      ? Math.round((userTasks.filter((t) => t.status === "done").length / userTasks.length) * 100)
      : 0
    const blockedPct = userTasks.length
      ? Math.round((userTasks.filter((t) => t.isBlocked).length / userTasks.length) * 100)
      : 0
    return {
      member: u.name.split(" ")[0],
      velocity: Math.min(cap.utilizationPercentage, 100),
      completion: donePct,
      availability: cap.totalAvailableHours > 0 ? 100 - blockedPct : 0,
    }
  })

// Sprint completion rate
const velocityCompletionRate = velocityData.map((v) => ({
  ...v,
  rate: Math.round((v.completed / v.committed) * 100),
}))

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous
  const isUp = delta > 0
  const isFlat = delta === 0
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        isFlat ? "text-muted-foreground border-border" :
        isUp ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"
      )}
    >
      {isFlat ? <Minus className="size-3" /> : isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {isFlat ? "Flat" : `${isUp ? "+" : ""}${delta}`}
    </Badge>
  )
}

export function ReportsContent() {
  const latestVelocity = velocityData[velocityData.length - 1]
  const prevVelocity = velocityData[velocityData.length - 2]
  const avgVelocity = Math.round(velocityData.reduce((s, v) => s + v.completed, 0) / velocityData.length)
  const predictivePoints = Math.round(avgVelocity * 0.95)

  const kpis = [
    {
      label: "Avg Sprint Velocity",
      value: `${avgVelocity} pts`,
      sub: "4-sprint average",
      trend: <TrendBadge current={latestVelocity.completed} previous={prevVelocity.completed} />,
    },
    {
      label: "Completion Rate",
      value: `${Math.round((latestVelocity.completed / latestVelocity.committed) * 100)}%`,
      sub: "Current sprint",
      trend: <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">On Track</Badge>,
    },
    {
      label: "Predicted Next Sprint",
      value: `${predictivePoints} pts`,
      sub: "Based on trend",
      trend: null,
    },
    {
      label: "Team Utilization",
      value: `${Math.round(capacities.reduce((s, c) => s + c.utilizationPercentage, 0) / capacities.length)}%`,
      sub: "Average",
      trend: <TrendBadge current={85} previous={78} />,
    },
  ]

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{k.sub}</p>
                {k.trend}
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="velocity">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="h-8">
              <TabsTrigger value="velocity" className="text-xs">Velocity</TabsTrigger>
              <TabsTrigger value="capacity" className="text-xs">Capacity</TabsTrigger>
              <TabsTrigger value="distribution" className="text-xs">Distribution</TabsTrigger>
              <TabsTrigger value="team" className="text-xs">Team Health</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Exporting report as PDF...")}
            >
              <Download data-icon="inline-start" className="size-3.5" />
              Export Report
            </Button>
          </div>

          {/* Velocity tab */}
          <TabsContent value="velocity" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Sprint Velocity — Committed vs Completed</CardTitle>
                  <CardDescription className="text-xs">Story points per sprint over the last 4 sprints</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      committed: { label: "Committed", color: "var(--chart-3)" },
                      completed: { label: "Completed", color: "var(--chart-1)" },
                    }}
                    className="h-56 w-full"
                  >
                    <BarChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="committed" fill="var(--chart-3)" radius={[3, 3, 0, 0]} opacity={0.6} />
                      <Bar dataKey="completed" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Completion Rate Over Time</CardTitle>
                  <CardDescription className="text-xs">Percentage of committed points delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ rate: { label: "Completion %", color: "var(--chart-1)" } }}
                    className="h-56 w-full"
                  >
                    <LineChart data={velocityCompletionRate} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="rate" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4, fill: "var(--chart-1)" }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Velocity table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Sprint Summary Table</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Sprint", "Committed", "Completed", "Rate", "Delta vs. Prev."].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 text-muted-foreground font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {velocityData.map((v, i) => {
                      const rate = Math.round((v.completed / v.committed) * 100)
                      const prev = velocityData[i - 1]
                      const delta = prev ? v.completed - prev.completed : null
                      return (
                        <tr key={v.sprint}>
                          <td className="py-2 pr-4 font-medium">{v.sprint}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{v.committed}</td>
                          <td className="py-2 pr-4 font-semibold">{v.completed}</td>
                          <td className="py-2 pr-4">
                            <span className={cn(
                              "font-semibold",
                              rate >= 90 ? "text-success" : rate >= 75 ? "text-warning-foreground" : "text-destructive"
                            )}>
                              {rate}%
                            </span>
                          </td>
                          <td className="py-2">
                            {delta !== null ? (
                              <span className={cn("flex items-center gap-1", delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
                                {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                                {delta > 0 ? "+" : ""}{delta} pts
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capacity tab */}
          <TabsContent value="capacity" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Capacity Utilization Trend</CardTitle>
                  <CardDescription className="text-xs">Average team utilization per sprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ utilization: { label: "Utilization %", color: "var(--chart-1)" } }}
                    className="h-56 w-full"
                  >
                    <LineChart data={capacityTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="utilization" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--chart-1)" }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Active Sprint Burndown</CardTitle>
                  <CardDescription className="text-xs">Ideal vs actual remaining story points</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ideal: { label: "Ideal", color: "var(--muted-foreground)" },
                      actual: { label: "Actual", color: "var(--chart-1)" },
                    }}
                    className="h-56 w-full"
                  >
                    <LineChart data={burndownData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="ideal" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--chart-1)" }} connectNulls={false} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribution tab */}
          <TabsContent value="distribution" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Task status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">By Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(taskStatusData.map((d) => [d.name, { label: d.name, color: d.fill }]))}
                    className="h-48 w-full"
                  >
                    <PieChart>
                      <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {taskStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-1 mt-2">
                    {taskStatusData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Task type */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">By Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(typeDistData.map((d) => [d.name, { label: d.name, color: d.fill }]))}
                    className="h-48 w-full"
                  >
                    <PieChart>
                      <Pie data={typeDistData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {typeDistData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-1 mt-2">
                    {typeDistData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">By Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(priorityData.map((d) => [d.name, { label: d.name, color: d.fill }]))}
                    className="h-48 w-full"
                  >
                    <PieChart>
                      <Pie data={priorityData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {priorityData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-1 mt-2">
                    {priorityData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team health radar */}
          <TabsContent value="team" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Team Health Radar</CardTitle>
                  <CardDescription className="text-xs">Velocity, completion rate, and availability per member</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      velocity: { label: "Velocity", color: "var(--chart-1)" },
                      completion: { label: "Completion", color: "var(--chart-2)" },
                      availability: { label: "Availability", color: "var(--chart-3)" },
                    }}
                    className="h-72 w-full"
                  >
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="member" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Velocity" dataKey="velocity" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                      <Radar name="Completion" dataKey="completion" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Per-member summary table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Member Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Member", "Tasks", "Done", "Rate", "Util."].map((h) => (
                          <th key={h} className="text-left pb-2 pr-3 text-muted-foreground font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.map((u) => {
                        const cap = capacities.find((c) => c.userId === u.id)
                        const userTasks = tasks.filter((t) => t.assigneeId === u.id)
                        const doneTasks = userTasks.filter((t) => t.status === "done").length
                        const rate = userTasks.length ? Math.round((doneTasks / userTasks.length) * 100) : 0
                        return (
                          <tr key={u.id}>
                            <td className="py-2 pr-3 font-medium">{u.name.split(" ")[0]}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{userTasks.length}</td>
                            <td className="py-2 pr-3 text-success font-medium">{doneTasks}</td>
                            <td className="py-2 pr-3">
                              <span className={cn("font-semibold", rate >= 50 ? "text-success" : "text-warning-foreground")}>{rate}%</span>
                            </td>
                            <td className="py-2">
                              {cap ? (
                                <span className={cn("font-semibold", cap.utilizationPercentage > 95 ? "text-destructive" : cap.utilizationPercentage > 80 ? "text-warning-foreground" : "text-success")}>
                                  {cap.utilizationPercentage}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
