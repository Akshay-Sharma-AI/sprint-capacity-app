"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Send,
  Users,
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import type { Mood } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Map the 5 emoji moods to display info. We store using existing Mood type values.
type EmojiMood = "great" | "good" | "okay" | "stuck" | "struggling"

const emojiMoodConfig: Record<EmojiMood, { emoji: string; label: string; mood: Mood }> = {
  great:      { emoji: "😊", label: "Great",      mood: "good"      },
  good:       { emoji: "🙂", label: "Good",       mood: "good"      },
  okay:       { emoji: "😐", label: "Okay",       mood: "neutral"   },
  stuck:      { emoji: "😟", label: "Stuck",      mood: "stuck"     },
  struggling: { emoji: "😫", label: "Struggling", mood: "overloaded"},
}

const moodDisplayConfig: Record<Mood, { label: string; emoji: string; className: string; bg: string }> = {
  good:       { label: "Good",       emoji: "🙂", className: "text-green-700",  bg: "bg-green-50  border-green-200"  },
  neutral:    { label: "Okay",       emoji: "😐", className: "text-slate-600",  bg: "bg-slate-50  border-slate-200"  },
  stuck:      { label: "Stuck",      emoji: "😟", className: "text-amber-700",  bg: "bg-amber-50  border-amber-200"  },
  overloaded: { label: "Struggling", emoji: "😫", className: "text-red-700",    bg: "bg-red-50    border-red-200"    },
}

function MoodSelector({
  value,
  onChange,
}: {
  value: EmojiMood
  onChange: (m: EmojiMood) => void
}) {
  const options: EmojiMood[] = ["great", "good", "okay", "stuck", "struggling"]
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((m) => {
        const cfg = emojiMoodConfig[m]
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              value === m
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <span className="text-base leading-none">{cfg.emoji}</span>
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

function UpdateCard({ update }: { update: { id: string; userId: string; date: string; workedOn: string; nextPlan: string; blockers: string; mood: Mood } }) {
  const { users } = useAppContext()
  const user = users.find((u) => u.id === update.userId)
  const mood = moodDisplayConfig[update.mood]

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-sm font-semibold text-foreground">{user.name}</span>
            <Badge
              variant="outline"
              className={cn("text-xs gap-1", mood.bg, mood.className)}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-3.5 text-green-600" />
                Yesterday I completed
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {update.workedOn || <span className="italic">Nothing shared</span>}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MessageCircle className="size-3.5 text-primary" />
                Today I&apos;m planning
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {update.nextPlan || <span className="italic">Nothing shared</span>}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <AlertTriangle
                  className={cn(
                    "size-3.5",
                    update.blockers ? "text-destructive" : "text-muted-foreground"
                  )}
                />
                Blockers
              </div>
              <p
                className={cn(
                  "text-xs leading-relaxed",
                  update.blockers ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {update.blockers || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function DailyUpdatesContent() {
  const { dailyUpdates, users, currentUserId, createDailyUpdate, activeSprintId } = useAppContext()

  const [emojiMood, setEmojiMood] = useState<EmojiMood>("good")
  const [workedOn, setWorkedOn] = useState("")
  const [nextPlan, setNextPlan] = useState("")
  const [blockers, setBlockers] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [filterDate, setFilterDate] = useState<string>("all")

  const today = new Date().toISOString().split("T")[0]

  const hasSubmittedToday = useMemo(() => {
    if (submitted) return true
    return dailyUpdates.some(
      (u) => u.userId === currentUserId && u.date === today
    )
  }, [dailyUpdates, currentUserId, today, submitted])

  // Team members who submitted today
  const submittedTodayCount = useMemo(() => {
    const submittedUserIds = new Set(
      dailyUpdates.filter((u) => u.date === today).map((u) => u.userId)
    )
    return submittedUserIds.size
  }, [dailyUpdates, today])

  // Group updates by date, most recent first
  const sorted = useMemo(
    () => [...dailyUpdates].sort((a, b) => b.date.localeCompare(a.date)),
    [dailyUpdates]
  )

  const dateGroups = useMemo(() => {
    return sorted.reduce<Record<string, typeof dailyUpdates>>((acc, u) => {
      if (!acc[u.date]) acc[u.date] = []
      acc[u.date].push(u)
      return acc
    }, {})
  }, [sorted])

  const dates = useMemo(() => Object.keys(dateGroups), [dateGroups])
  const displayDates = filterDate === "all" ? dates : dates.filter((d) => d === filterDate)

  async function handleSubmit() {
    if (!workedOn.trim()) {
      toast.error("Please fill in what you completed yesterday.")
      return
    }
    if (!currentUserId) {
      toast.error("No user session found.")
      return
    }

    setSubmitting(true)
    try {
      await createDailyUpdate({
        userId: currentUserId,
        taskId: "",
        date: today,
        workedOn: workedOn.trim(),
        nextPlan: nextPlan.trim(),
        blockers: blockers.trim(),
        hoursLogged: 0,
        mood: emojiMoodConfig[emojiMood].mood,
        ...(activeSprintId ? { sprintId: activeSprintId } : {}),
      } as any)
      toast.success("Daily update submitted!")
      setSubmitted(true)
      setWorkedOn("")
      setNextPlan("")
      setBlockers("")
      setEmojiMood("good")
    } catch {
      toast.error("Failed to submit update. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateStr: string) {
    // Add T12:00 to avoid timezone offset shifting the date
    const d = new Date(dateStr + "T12:00:00")
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  function formatDateShort(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00")
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Header stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>
            <span className="font-semibold text-foreground">{submittedTodayCount}</span>
            {" / "}
            <span className="font-semibold text-foreground">{users.length}</span>
            {" team members submitted today"}
          </span>
        </div>

        {/* Submit form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Post Your Update</span>
              {hasSubmittedToday && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle2 className="size-3" />
                  Submitted Today
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSubmittedToday ? (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="size-5 text-green-600 mx-auto mb-2" />
                You&apos;ve already submitted your update for today. Come back tomorrow!
              </div>
            ) : (
              <>
                {/* Mood selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">How are you feeling today?</Label>
                  <MoodSelector value={emojiMood} onChange={setEmojiMood} />
                </div>

                {/* Text fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-green-600" />
                      Yesterday I completed:
                    </Label>
                    <Textarea
                      placeholder="Describe what you accomplished..."
                      className="resize-none h-28 text-xs"
                      value={workedOn}
                      onChange={(e) => setWorkedOn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <MessageCircle className="size-3.5 text-primary" />
                      Today I&apos;m planning:
                    </Label>
                    <Textarea
                      placeholder="What do you plan to work on..."
                      className="resize-none h-28 text-xs"
                      value={nextPlan}
                      onChange={(e) => setNextPlan(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-amber-600" />
                      Blockers:
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      placeholder="Any blockers or impediments..."
                      className="resize-none h-28 text-xs"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    <Send className="size-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Update"}
                  </Button>
                </div>
              </>
            )}
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
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All dates
                  </SelectItem>
                  {dates.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {formatDateShort(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayDates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <CalendarDays className="size-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No updates yet</p>
              <p className="text-xs mt-1">Be the first to post today&apos;s update!</p>
            </div>
          ) : (
            displayDates.map((date) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <CalendarDays className="size-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {formatDate(date)}
                      {date === today && (
                        <Badge className="ml-2 text-xs py-0 h-4" variant="secondary">
                          Today
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {dateGroups[date].length}{" "}
                    {dateGroups[date].length === 1 ? "update" : "updates"}
                  </span>
                </div>
                <div className="space-y-2">
                  {dateGroups[date].map((u) => (
                    <UpdateCard key={u.id} update={u} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
