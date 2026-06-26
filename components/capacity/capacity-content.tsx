"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  CalendarDays,
  Save,
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const DEFAULT_AVAILABLE_HOURS = 80

function getUtilizationColor(pct: number): string {
  if (pct > 100) return "#ef4444"   // red
  if (pct >= 80) return "#f59e0b"   // yellow/amber
  return "#22c55e"                   // green
}

function getProgressClass(pct: number): string {
  if (pct > 100) return "[&>div]:bg-red-500"
  if (pct >= 80) return "[&>div]:bg-amber-400"
  return "[&>div]:bg-green-500"
}

type StatusKey = "available" | "partial" | "overloaded"

function deriveStatus(pct: number): StatusKey {
  if (pct > 100) return "overloaded"
  if (pct >= 80) return "partial"
  return "available"
}

const statusConfig: Record<StatusKey, { label: string; className: string; icon: React.ElementType }> = {
  available: {
    label: "Available",
    className: "bg-green-500/10 text-green-600 border-green-500/30",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partial",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    icon: MinusCircle,
  },
  overloaded: {
    label: "Overloaded",
    className: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: AlertTriangle,
  },
}

export function CapacityContent() {
  const { capacities, users, sprints, activeSprintId, setActiveSprintId, updateCapacity } = useAppContext()

  // Local edits: userId -> availableHours string
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const selectedSprintId = activeSprintId ?? (sprints[0]?.id ?? null)
  const selectedSprint = sprints.find(s => s.id === selectedSprintId) ?? null

  // Build row data for all users for selected sprint
  const rows = useMemo(() => {
    return users.map(user => {
      const cap = capacities.find(c => c.userId === user.id && c.sprintId === selectedSprintId)
      const availableHours = cap?.totalAvailableHours ?? DEFAULT_AVAILABLE_HOURS
      const allocatedHours = cap?.allocatedHours ?? 0
      const remainingHours = availableHours - allocatedHours
      const utilizationPct = availableHours > 0 ? Math.round((allocatedHours / availableHours) * 100) : 0
      const status = deriveStatus(utilizationPct)
      return { user, availableHours, allocatedHours, remainingHours, utilizationPct, status }
    })
  }, [users, capacities, selectedSprintId])

  // KPI summaries
  const totalAvailable = rows.reduce((s, r) => s + r.availableHours, 0)
  const totalAllocated = rows.reduce((s, r) => s + r.allocatedHours, 0)
  const totalRemaining = totalAvailable - totalAllocated
  const avgUtilization = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.utilizationPct, 0) / rows.length)
    : 0

  const kpis = [
    { label: "Total Available Hours", value: `${totalAvailable}h`, icon: Clock, sub: `${users.length} members` },
    { label: "Allocated Hours", value: `${totalAllocated}h`, icon: CheckCircle2, sub: `${totalAvailable > 0 ? Math.round((totalAllocated / totalAvailable) * 100) : 0}% of capacity` },
    { label: "Remaining Hours", value: `${totalRemaining}h`, icon: CalendarDays, sub: totalRemaining < 0 ? "Over capacity" : "Unallocated" },
    { label: "Avg Utilization", value: `${avgUtilization}%`, icon: AlertTriangle, sub: avgUtilization > 85 ? "High load" : avgUtilization > 0 ? "On track" : "No data" },
  ]

  const chartData = rows.map(r => ({
    name: r.user.name.split(" ")[0],
    utilization: r.utilizationPct,
    fill: getUtilizationColor(r.utilizationPct),
  }))

  async function handleSave(userId: string, currentAvailable: number) {
    if (!selectedSprintId) return
    const raw = edits[userId]
    const parsed = raw !== undefined ? parseInt(raw, 10) : currentAvailable
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Please enter a valid number of hours")
      return
    }
    setSaving(prev => ({ ...prev, [userId]: true }))
    try {
      await updateCapacity(userId, selectedSprintId, { totalAvailableHours: parsed })
      setEdits(prev => { const n = { ...prev }; delete n[userId]; return n })
      toast.success("Capacity updated")
    } catch {
      toast.error("Failed to update capacity")
    } finally {
      setSaving(prev => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">

        {/* Sprint Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Sprint:</span>
          <Select
            value={selectedSprintId ?? ""}
            onValueChange={val => { setActiveSprintId(val); setEdits({}) }}
          >
            <SelectTrigger className="w-56 h-8 text-xs">
              <SelectValue placeholder="Select a sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name}
                  {s.status === "active" && (
                    <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1">Active</Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSprint && (
            <span className="text-xs text-muted-foreground">
              {new Date(selectedSprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" — "}
              {new Date(selectedSprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Empty state */}
        {!selectedSprint ? (
          <Card className="p-12 text-center">
            <CalendarDays className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No sprint selected</p>
            <p className="text-xs text-muted-foreground mt-1">Select or create a sprint to manage capacity.</p>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kpis.map(kpi => {
                const Icon = kpi.icon
                return (
                  <Card key={kpi.label} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="size-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
                  </Card>
                )
              })}
            </div>

            {/* Capacity Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Team Capacity</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Member", "Available Hours", "Allocated Hours", "Remaining", "Utilization", "Status", ""].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ user, availableHours, allocatedHours, remainingHours, utilizationPct, status }) => {
                      const cfg = statusConfig[status]
                      const StatusIcon = cfg.icon
                      const editVal = edits[user.id]
                      const displayAvail = editVal !== undefined ? editVal : String(availableHours)
                      const isDirty = edits[user.id] !== undefined
                      const isSaving = saving[user.id] ?? false

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                        >
                          {/* Member */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7 shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-xs text-foreground whitespace-nowrap">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                              </div>
                            </div>
                          </td>

                          {/* Available Hours (editable) */}
                          <td className="px-3 py-2.5">
                            <Input
                              type="number"
                              min={0}
                              value={displayAvail}
                              onChange={e => setEdits(prev => ({ ...prev, [user.id]: e.target.value }))}
                              className="w-20 h-7 text-xs"
                            />
                          </td>

                          {/* Allocated */}
                          <td className="px-3 py-2.5 text-xs font-medium text-center">{allocatedHours}h</td>

                          {/* Remaining */}
                          <td className={cn("px-3 py-2.5 text-xs font-medium text-center", remainingHours < 0 && "text-red-500")}>
                            {remainingHours}h
                          </td>

                          {/* Utilization with progress bar */}
                          <td className="px-3 py-2.5 min-w-36">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={Math.min(utilizationPct, 100)}
                                className={cn("h-1.5 flex-1", getProgressClass(utilizationPct))}
                              />
                              <span className={cn(
                                "text-xs font-semibold w-9 shrink-0 text-right",
                                utilizationPct > 100 ? "text-red-500" : utilizationPct >= 80 ? "text-amber-500" : "text-green-600"
                              )}>
                                {utilizationPct}%
                              </span>
                            </div>
                          </td>

                          {/* Status badge */}
                          <td className="px-3 py-2.5">
                            <Badge variant="outline" className={cn("text-xs gap-1 whitespace-nowrap", cfg.className)}>
                              <StatusIcon className="size-3" />
                              {cfg.label}
                            </Badge>
                          </td>

                          {/* Update button */}
                          <td className="px-3 py-2.5">
                            <Button
                              size="sm"
                              variant={isDirty ? "default" : "outline"}
                              className="h-7 text-xs px-2 gap-1"
                              disabled={!isDirty || isSaving}
                              onClick={() => handleSave(user.id, availableHours)}
                            >
                              <Save className="size-3" />
                              {isSaving ? "Saving…" : "Update"}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">
                          No team members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Utilization Bar Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Utilization by Member (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, Math.max(120, Math.max(...chartData.map(d => d.utilization)) + 10)]}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, "Utilization"]}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 justify-center">
                    {[
                      { color: "#22c55e", label: "< 80% (On track)" },
                      { color: "#f59e0b", label: "80–100% (Partial)" },
                      { color: "#ef4444", label: "> 100% (Overloaded)" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-full" style={{ background: l.color }} />
                        <span className="text-[11px] text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  )
}
