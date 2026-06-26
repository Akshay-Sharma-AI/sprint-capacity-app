"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { type Mood } from "@/lib/mock-data"

interface DailyUpdateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  taskId: string
}

const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: "good", label: "Good", emoji: "😊" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "stuck", label: "Stuck", emoji: "😕" },
  { value: "overloaded", label: "Overloaded", emoji: "😰" },
]

export function DailyUpdateModal({ open, onOpenChange, userId, taskId }: DailyUpdateModalProps) {
  const { createDailyUpdate } = useApp()
  const [workedOn, setWorkedOn] = useState("")
  const [nextPlan, setNextPlan] = useState("")
  const [blockers, setBlockers] = useState("")
  const [mood, setMood] = useState<Mood>("good")
  const [hoursLogged, setHoursLogged] = useState(8)

  const handleSubmit = () => {
    if (!workedOn.trim()) {
      toast.error("Please describe what you worked on")
      return
    }

    createDailyUpdate({
      userId,
      taskId,
      date: new Date().toISOString().split("T")[0],
      workedOn: workedOn.trim(),
      nextPlan: nextPlan.trim(),
      blockers: blockers.trim(),
      hoursLogged,
      mood,
    })

    toast.success("Daily update submitted")
    onOpenChange(false)
    setWorkedOn("")
    setNextPlan("")
    setBlockers("")
    setMood("good")
    setHoursLogged(8)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Standup Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="workedOn">What did you work on today?</Label>
            <Textarea
              id="workedOn"
              placeholder="Describe your work and progress..."
              value={workedOn}
              onChange={(e) => setWorkedOn(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="nextPlan">What's next?</Label>
            <Textarea
              id="nextPlan"
              placeholder="What are your plans for tomorrow?..."
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="blockers">Any blockers?</Label>
            <Textarea
              id="blockers"
              placeholder="Describe any blockers or challenges..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label>How are you feeling?</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-md border-2 transition-all ${
                    mood === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="hoursLogged">Hours logged today</Label>
            <input
              id="hoursLogged"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hoursLogged}
              onChange={(e) => setHoursLogged(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm font-medium mt-2">{hoursLogged} hours</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
