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
import { type TaskType, type TaskPriority } from "@/lib/mock-data"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  sprintId?: string
}

const taskTypes: TaskType[] = ["story", "task", "bug", "epic"]
const priorities: TaskPriority[] = ["low", "medium", "high", "critical"]

export function CreateTaskModal({ open, onOpenChange, projectId, sprintId }: CreateTaskModalProps) {
  const { createTask, users } = useApp()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("story")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || "")
  const [storyPoints, setStoryPoints] = useState(5)
  const [estimatedHours, setEstimatedHours] = useState(8)

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Task title is required")
      return
    }

    createTask({
      projectId,
      sprintId: sprintId || null,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status: "todo",
      assigneeId,
      storyPoints,
      estimatedHours,
      loggedHours: 0,
      remainingHours: estimatedHours,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isBlocked: false,
      blockerReason: "",
      comments: 0,
      labels: [],
    })

    toast.success("Task created successfully")
    onOpenChange(false)
    setTitle("")
    setDescription("")
    setType("story")
    setPriority("medium")
    setAssigneeId(users[0]?.id || "")
    setStoryPoints(5)
    setEstimatedHours(8)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Implement login form"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task details and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
              >
                {taskTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="assignee">Assign To</Label>
            <select
              id="assignee"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="1"
                max="21"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                max="160"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
