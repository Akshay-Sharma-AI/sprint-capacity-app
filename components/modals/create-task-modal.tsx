"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
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
  projectId?: string
  sprintId?: string
}

const taskTypes: TaskType[] = ["story", "task", "bug", "epic"]
const priorities: TaskPriority[] = ["low", "medium", "high", "critical"]

function getInitialState(
  users: Array<{ id: string; name: string }>,
  projects: Array<{ id: string; name: string }>,
  activeSprintId: string | null,
  propProjectId?: string,
) {
  return {
    title: "",
    description: "",
    type: "story" as TaskType,
    priority: "medium" as TaskPriority,
    assigneeId: users[0]?.id || "",
    projectId: propProjectId || projects[0]?.id || "",
    storyPoints: 5,
    estimatedHours: 8,
    addToSprint: !!activeSprintId,
  }
}

export function CreateTaskModal({ open, onOpenChange, projectId: propProjectId, sprintId }: CreateTaskModalProps) {
  const { createTask, projects, users, activeSprintId } = useAppContext()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("story")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || "")
  const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || projects[0]?.id || "")
  const [storyPoints, setStoryPoints] = useState(5)
  const [estimatedHours, setEstimatedHours] = useState(8)
  const [addToSprint, setAddToSprint] = useState(!!activeSprintId)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    const defaults = getInitialState(users, projects, activeSprintId, propProjectId)
    setTitle(defaults.title)
    setDescription(defaults.description)
    setType(defaults.type)
    setPriority(defaults.priority)
    setAssigneeId(defaults.assigneeId)
    setSelectedProjectId(defaults.projectId)
    setStoryPoints(defaults.storyPoints)
    setEstimatedHours(defaults.estimatedHours)
    setAddToSprint(defaults.addToSprint)
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Task title is required")
      return
    }

    const resolvedSprintId = sprintId || (addToSprint && activeSprintId ? activeSprintId : null)

    setLoading(true)
    try {
      await createTask({
        projectId: selectedProjectId,
        sprintId: resolvedSprintId || null,
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
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error("Failed to create task. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
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
            <Label htmlFor="assignee">Assignee</Label>
            <select
              id="assignee"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {!propProjectId && (
            <div>
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                max="13"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>
          </div>
          {activeSprintId && !sprintId && (
            <div className="flex items-center gap-2">
              <input
                id="addToSprint"
                type="checkbox"
                checked={addToSprint}
                onChange={(e) => setAddToSprint(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="addToSprint" className="cursor-pointer font-normal">
                Add to current sprint
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
