"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import {
  Plus,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Calendar,
  Users,
} from "lucide-react"
import { capacities, users, sprints, type CapacityStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const statusConfig: Record<CapacityStatus, { label: string; className: string; icon: React.ElementType; rowClass: string }> = {
  overloaded: {
    label: "Overloaded",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    icon: AlertTriangle,
    rowClass: "bg-destructive/3",
  },
  balanced: {
    label: "Balanced",
    className: "bg-[oklch(0.62_0.15_148/0.1)] text-[oklch(0.42_0.15_148)] border-[oklch(0.62_0.15_148/0.3)]",
    icon: CheckCircle2,
    rowClass: "",
  },
  underallocated: {
    label: "Underallocated",
    className: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]",
    icon: MinusCircle,
    rowClass: "",
  },
}

const utilizationColor = (pct: number) => {
  if (pct > 95) return "var(--chart-5)"
  if (pct > 80) return "var(--chart-1)"
  if (pct > 50) return "var(--chart-2)"
  return "var(--chart-3)"
}

export function CapacityContent() {
  const [availOpen, setAvailOpen] = useState(false)
  const sprint = sprints.find((s) => s.id === "s1")!

  const tableData = capacities
    .map((cap) => ({ cap, user: users.find((u) => u.id === cap.userId)! }))
    .filter((d) => d.user)

  const totalAvail = capacities.reduce((s, c) => s + c.totalAvailableHours, 0)
  const totalAlloc = capacities.reduce((s, c) => s + c.allocatedHours, 0)
  const avgUtil = Math.round((totalAlloc / totalAvail) * 100)

  const chartData = tableData.map(({ cap, user }) => ({
    name: user.name.split(" ")[0],
    available: cap.totalAvailableHours,
    allocated: Math.min(cap.allocatedHours, cap.totalAvailableHours),
    overalloc: Math.max(0, cap.allocatedHours - cap.totalAvailableHours),
    utilization: cap.utilizationPercentage,
  }))

  const chartConfig = {
    available: { label: "Available", color: "var(--chart-2)" },
    allocated: { label: "Allocated", color: "var(--chart-1)" },
    overalloc: { label: "Over Capacity", color: "var(--chart-5)" },
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Sprint selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary" />
              {sprint.name} — Active
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" — "}
              {new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              <span className="ml-1">· 10 working days</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAvailOpen(true)}>
              <Calendar data-icon="inline-start" className="size-3.5" />
              Update Availability
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Workload auto-balanced!")}>
              <RefreshCw data-icon="inline-start" className="size-3.5" />
              Auto-Balance
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Exporting report...")}>
              <Download data-icon="inline-start" className="size-3.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => toast.info("Add team member dialog")}>
              <Plus data-icon="inline-start" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Available", value: `${totalAvail}h`, sub: `${tableData.length} team members` },
            { label: "Total Allocated", value: `${totalAlloc}h`, sub: `${Math.round((totalAlloc / totalAvail) * 100)}% of capacity` },
            { label: "Remaining", value: `${totalAvail - totalAlloc}h`, sub: "Unallocated" },
            { label: "Avg Utilization", value: `${avgUtil}%`, sub: avgUtil > 85 ? "High load" : "On track" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="table">
          <TabsList className="h-8">
            <TabsTrigger value="table" className="text-xs">Capacity Table</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
          </TabsList>

          {/* Table tab */}
          <TabsContent value="table" className="mt-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Team Member", "Role", "Avail. Days", "Daily Cap.", "Total Avail.", "Leave/Holiday", "Allocated", "Remaining", "Utilization", "Status"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map(({ cap, user }) => {
                      const cfg = statusConfig[cap.status]
                      const StatusIcon = cfg.icon
                      const pct = Math.min(cap.utilizationPercentage, 100)
                      return (
                        <tr
                          key={user.id}
                          className={cn("border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors", cfg.rowClass)}
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7 shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground text-xs whitespace-nowrap">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">{user.role}</td>
                          <td className="px-3 py-2.5 text-xs font-medium text-center">{cap.availableDays}</td>
                          <td className="px-3 py-2.5 text-xs text-center">{cap.dailyCapacityHours}h</td>
                          <td className="px-3 py-2.5 text-xs font-medium text-center">{cap.totalAvailableHours}h</td>
                          <td className="px-3 py-2.5 text-xs text-center text-muted-foreground">{cap.leaveHours}h</td>
                          <td className="px-3 py-2.5 text-xs font-medium text-center">{cap.allocatedHours}h</td>
                          <td className={cn("px-3 py-2.5 text-xs font-medium text-center", cap.remainingHours < 0 && "text-destructive")}>
                            {cap.remainingHours}h
                          </td>
                          <td className="px-3 py-2.5 min-w-28">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={pct}
                                className={cn(
                                  "h-1.5 flex-1",
                                  cap.utilizationPercentage > 95 && "[&>div]:bg-destructive",
                                  cap.utilizationPercentage > 80 && cap.utilizationPercentage <= 95 && "[&>div]:bg-[oklch(0.74_0.16_80)]",
                                )}
                              />
                              <span className={cn(
                                "text-xs font-semibold w-8 shrink-0",
                                cap.utilizationPercentage > 95 ? "text-destructive" : cap.utilizationPercentage > 80 ? "text-[oklch(0.5_0.16_80)]" : "text-[oklch(0.42_0.15_148)]"
                              )}>
                                {cap.utilizationPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant="outline" className={cn("text-xs whitespace-nowrap", cfg.className)}>
                              <StatusIcon className="size-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Charts tab */}
          <TabsContent value="charts" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Allocated vs Available Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-60 w-full">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="available" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="allocated" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Utilization by Member (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ utilization: { label: "Utilization %" } }} className="h-60 w-full">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={42} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="utilization" radius={[0, 3, 3, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={utilizationColor(entry.utilization)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Availability Dialog */}
      <Dialog open={availOpen} onOpenChange={setAvailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Update your availability for the current sprint.</p>
            <div className="space-y-1.5">
              <Label>Available Days</Label>
              <Input type="number" defaultValue={10} min={0} max={10} />
            </div>
            <div className="space-y-1.5">
              <Label>Leave / Holiday Hours</Label>
              <Input type="number" defaultValue={0} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input placeholder="e.g. Remote on Thursday" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAvailOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Availability updated"); setAvailOpen(false) }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}
