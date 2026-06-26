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
import { type Task } from "@/lib/mock-data"

interface BlockTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export function BlockTaskModal({ open, onOpenChange, task }: BlockTaskModalProps) {
  const { updateTask } = useApp()
  const [reason, setReason] = useState("")

  const handleBlock = () => {
    if (!task) return

    if (!reason.trim()) {
      toast.error("Please provide a reason for blocking this task")
      return
    }

    updateTask(task.id, {
      isBlocked: true,
      blockerReason: reason.trim(),
      status: "blocked",
    })

    toast.success("Task blocked")
    onOpenChange(false)
    setReason("")
  }

  const handleUnblock = () => {
    if (!task) return

    updateTask(task.id, {
      isBlocked: false,
      blockerReason: "",
      status: "todo",
    })

    toast.success("Task unblocked")
    onOpenChange(false)
    setReason("")
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.isBlocked ? "Unblock" : "Block"} Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Task: {task.title}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Current Status: {task.isBlocked ? "Blocked" : "Active"}
            </div>
          </div>

          {!task.isBlocked ? (
            <div>
              <Label htmlFor="reason">Why is this task blocked?</Label>
              <Textarea
                id="reason"
                placeholder="Describe the blocker and what's needed to unblock it..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          ) : (
            <div className="bg-destructive/10 p-3 rounded-md">
              <div className="text-sm font-semibold text-destructive mb-2">Blocker Reason:</div>
              <div className="text-sm">{task.blockerReason}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!task.isBlocked ? (
            <Button variant="destructive" onClick={handleBlock}>
              Block Task
            </Button>
          ) : (
            <Button onClick={handleUnblock}>Unblock Task</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
