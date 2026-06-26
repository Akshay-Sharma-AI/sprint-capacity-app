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

interface CreateSprintModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function CreateSprintModal({ open, onOpenChange, projectId }: CreateSprintModalProps) {
  const { createSprint } = useApp()
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [durationDays, setDurationDays] = useState(14)

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Sprint name is required")
      return
    }

    const end = new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]

    createSprint({
      projectId,
      name: name.trim(),
      goal: goal.trim(),
      startDate,
      endDate: end,
      status: "planning",
      committedStoryPoints: 0,
      completedStoryPoints: 0,
    })

    toast.success("Sprint created successfully")
    onOpenChange(false)
    setName("")
    setGoal("")
    setStartDate(new Date().toISOString().split("T")[0])
    setDurationDays(14)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Sprint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sprint 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goal">Sprint Goal</Label>
            <Textarea
              id="goal"
              placeholder="What should this sprint achieve?..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Sprint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
