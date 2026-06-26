"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Smile,
  Meh,
  AlertCircle,
  TrendingDown,
  Plus,
  Clock,
  CalendarDays,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { dailyUpdates, users, tasks, type Mood } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const moodConfig: Record<Mood, { label: string; icon: React.ElementType; className: string; bg: string }> = {
  good: { label: "Feeling Good", icon: Smile, className: "text-success", bg: "bg-success/10 border-success/30" },
  neutral: { label: "Neutral", icon: Meh, className: "text-muted-foreground", bg: "bg-muted border-border" },
  stuck: { label: "Stuck", icon: AlertCircle, className: "text-warning-foreground", bg: "bg-warning/10 border-warning/30" },
  overloaded: { label: "Overloaded", icon: TrendingDown, className: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
}

function MoodPicker({ value, onChange }: { value: Mood; onChange: (m: Mood) => void }) {
  const moods: Mood[] = ["good", "neutral", "stuck", "overloaded"]
  return (
    <div className="flex gap-2 flex-wrap">
      {moods.map((m) => {
        const cfg = moodConfig[m]
        const Icon = cfg.icon
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
              value === m ? cn(cfg.bg, cfg.className, "ring-2 ring-offset-1 ring-current") : "bg-background border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <Icon className="size-4" />
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

function UpdateCard({ update }: { update: typeof dailyUpdates[0] }) {
  const user = users.find((u) => u.id === update.userId)
  const task = tasks.find((t) => t.id === update.taskId)
  const mood = moodConfig[update.mood]
  const MoodIcon = mood.icon
  const date = new Date(update.date)

  if (!user) return null

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{user.name}</span>
              <Badge variant="outline" className={cn("text-xs", mood.bg, mood.className)}>
                <MoodIcon className="size-3" />
                {mood.label}
              </Badge>
              {task && (
                <Badge variant="secondary" className="text-xs truncate max-w-40">
                  {task.title.length > 30 ? task.title.substring(0, 30) + "…" : task.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {update.hoursLogged}h logged
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-3.5 text-success" />
                Worked on
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{update.workedOn}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MessageCircle className="size-3.5 text-primary" />
                Next plans
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{update.nextPlan}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <AlertTriangle className={cn("size-3.5", update.blockers ? "text-destructive" : "text-muted-foreground")} />
                Blockers
              </div>
              <p className={cn("text-xs leading-relaxed", update.blockers ? "text-destructive" : "text-muted-foreground")}>
                {update.blockers || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

const myTasks = tasks.filter((t) => t.assigneeId === "u1")

export function DailyUpdatesContent() {
  const [mood, setMood] = useState<Mood>("good")
  const [workedOn, setWorkedOn] = useState("")
  const [nextPlan, setNextPlan] = useState("")
  const [blockers, setBlockers] = useState("")
  const [hours, setHours] = useState("")
  const [taskId, setTaskId] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [filterDate, setFilterDate] = useState<string>("all")

  // Group updates by date
  const sorted = [...dailyUpdates].sort((a, b) => b.date.localeCompare(a.date))
  const dateGroups = sorted.reduce<Record<string, typeof dailyUpdates>>((acc, u) => {
    if (!acc[u.date]) acc[u.date] = []
    acc[u.date].push(u)
    return acc
  }, {})

  const dates = Object.keys(dateGroups)
  const displayDates = filterDate === "all" ? dates : [filterDate]

  const hasSubmittedToday = dailyUpdates.some(
    (u) => u.userId === "u1" && u.date === "2025-06-25"
  ) || submitted

  function handleSubmit() {
    if (!workedOn.trim()) {
      toast.error("Please fill in what you worked on.")
      return
    }
    toast.success("Daily update submitted!")
    setSubmitted(true)
    setWorkedOn("")
    setNextPlan("")
    setBlockers("")
    setHours("")
    setTaskId("")
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Submit form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Submit Today&apos;s Update</span>
              {hasSubmittedToday && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                  <CheckCircle2 className="size-3" />
                  Submitted Today
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-xs">How are you feeling today?</Label>
              <MoodPicker value={mood} onChange={setMood} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Related Task</Label>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {myTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.title.length > 40 ? t.title.substring(0, 40) + "…" : t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hours Logged</Label>
                <Input
                  type="number"
                  placeholder="e.g. 6.5"
                  min="0"
                  step="0.5"
                  className="h-8 text-xs"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  What did you work on?
                </Label>
                <Textarea
                  placeholder="Describe what you accomplished today..."
                  className="resize-none h-24 text-xs"
                  value={workedOn}
                  onChange={(e) => setWorkedOn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <MessageCircle className="size-3.5 text-primary" />
                  What are your plans for tomorrow?
                </Label>
                <Textarea
                  placeholder="What do you plan to work on next..."
                  className="resize-none h-24 text-xs"
                  value={nextPlan}
                  onChange={(e) => setNextPlan(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-destructive" />
                  Any blockers?
                </Label>
                <Textarea
                  placeholder="Describe any blockers or impediments..."
                  className="resize-none h-24 text-xs"
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit}>
                <Plus data-icon="inline-start" />
                Submit Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Team updates feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-foreground">Team Updates</h2>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Filter by date</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="h-7 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All dates</SelectItem>
                  {dates.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayDates.map((date) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{dateGroups[date].length} updates</span>
              </div>
              <div className="space-y-2">
                {dateGroups[date].map((u) => (
                  <UpdateCard key={u.id} update={u} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
