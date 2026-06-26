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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { type Task } from "@/lib/mock-data"

interface LogHoursModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export function LogHoursModal({ open, onOpenChange, task }: LogHoursModalProps) {
  const { updateTask } = useApp()
  const [hours, setHours] = useState(1)
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    if (!task) return

    if (hours <= 0) {
      toast.error("Please enter a valid number of hours")
      return
    }

    const newLoggedHours = task.loggedHours + hours
    const newRemainingHours = Math.max(0, task.remainingHours - hours)

    updateTask(task.id, {
      loggedHours: newLoggedHours,
      remainingHours: newRemainingHours,
    })

    toast.success(`${hours} hours logged successfully`)
    onOpenChange(false)
    setHours(1)
    setNotes("")
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Hours - {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-muted p-3 rounded-md text-sm">
            <div>
              <div className="text-muted-foreground">Estimated</div>
              <div className="font-semibold">{task.estimatedHours}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Logged</div>
              <div className="font-semibold">{task.loggedHours}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Remaining</div>
              <div className="font-semibold">{task.remainingHours}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Progress</div>
              <div className="font-semibold">
                {task.estimatedHours > 0
                  ? Math.round((task.loggedHours / task.estimatedHours) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="hours">Hours to Log</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0.5"
              max={task.remainingHours}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What did you work on?..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Log Hours</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
