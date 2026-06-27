"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Bug,
  Zap,
  BookOpen,
  CheckSquare,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  Package,
  InboxIcon,
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import type { TaskType, TaskPriority } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Type & priority config ──────────────────────────────────────────────────

const typeIcons: Record<TaskType, React.ElementType> = {
  story: BookOpen,
  task: CheckSquare,
  bug: Bug,
  epic: Zap,
}

const typeColors: Record<TaskType, string> = {
  story: "text-blue-500",
  task: "text-muted-foreground",
  bug: "text-destructive",
  epic: "text-purple-500",
}

const priorityBadge: Record<TaskPriority, { label: string; className: string }> = {
  low:      { label: "Low",      className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400" },
  medium:   { label: "Medium",   className: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400" },
  high:     { label: "High",     className: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400" },
  critical: { label: "Critical", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400" },
}

const statusBadge: Record<string, { label: string; className: string }> = {
  "todo":        { label: "To Do",      className: "bg-muted text-muted-foreground border-border" },
  "in-progress": { label: "In Progress", className: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400" },
  "in-review":   { label: "In Review",  className: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400" },
  "done":        { label: "Done",       className: "bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400" },
  "blocked":     { label: "Blocked",    className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400" },
}

// ── Default form state ───────────────────────────────────────────────────────

const defaultForm = {
  title: "",
  description: "",
  type: "task" as TaskType,
  priority: "medium" as TaskPriority,
  storyPoints: "",
  assigneeId: "",
  estimatedHours: "",
  addToSprint: false,
}

// ── Component ────────────────────────────────────────────────────────────────

export function BacklogContent() {
  const {
    tasks,
    users,
    sprints,
    projects,
    activeSprintId,
    setActiveSprintId,
    currentUserId,
    createTask,
    updateTask,
    deleteTask,
    createSprint,
  } = useAppContext()

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [creating, setCreating] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Create sprint dialog
  const [sprintOpen, setSprintOpen] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: "", goal: "", startDate: "", endDate: "", projectId: "", status: "active" })
  const [creatingSprint, setCreatingSprint] = useState(false)

  // ── Derived data ───────────────────────────────────────────────────────────

  const activeSprint = sprints.find((s) => s.id === activeSprintId)
  const defaultProjectId = projects[0]?.id ?? ""

  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprintId)
  const backlogTasks = tasks.filter((t) => !t.sprintId)

  const applyFilters = <T extends { title: string; type: string; priority: string }>(
    items: T[]
  ): T[] =>
    items.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === "all" || t.type === filterType
      const matchPriority = filterPriority === "all" || t.priority === filterPriority
      return matchSearch && matchType && matchPriority
    })

  const filteredSprint = applyFilters(sprintTasks)
  const filteredBacklog = applyFilters(backlogTasks)

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMoveToSprint = async (taskId: string) => {
    if (!activeSprintId) {
      toast.error("No active sprint found")
      return
    }
    try {
      await updateTask(taskId, { sprintId: activeSprintId })
      toast.success("Task moved to active sprint")
    } catch {
      toast.error("Failed to move task")
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!currentUserId) {
      toast.error("Sign in to create tasks")
      return
    }
    setCreating(true)
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description,
        type: form.type,
        priority: form.priority,
        status: "todo",
        storyPoints: form.storyPoints ? Number(form.storyPoints) : 0,
        assigneeId: form.assigneeId || "",
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : 0,
        loggedHours: 0,
        remainingHours: form.estimatedHours ? Number(form.estimatedHours) : 0,
        projectId: defaultProjectId,
        sprintId: form.addToSprint && activeSprintId ? activeSprintId : null,
        dueDate: "",
        isBlocked: false,
        blockerReason: "",
        comments: 0,
        labels: [],
      })
      toast.success(`"${form.title}" ${form.addToSprint ? "added to sprint" : "added to backlog"}`)
      setCreateOpen(false)
      setForm(defaultForm)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTask(deleteId)
      toast.success("Task deleted")
    } catch {
      toast.error("Failed to delete task")
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleCreateSprint = async () => {
    if (!sprintForm.name.trim()) { toast.error("Sprint name is required"); return }
    if (!sprintForm.startDate || !sprintForm.endDate) { toast.error("Start and end dates are required"); return }
    if (!currentUserId) { toast.error("Sign in to create a sprint"); return }
    const pid = sprintForm.projectId || defaultProjectId
    if (!pid) { toast.error("Create a project first before creating a sprint"); return }
    setCreatingSprint(true)
    try {
      await createSprint({
        projectId: pid,
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim(),
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        status: sprintForm.status as any,
        committedStoryPoints: 0,
        completedStoryPoints: 0,
      })
      toast.success(`Sprint "${sprintForm.name}" created${sprintForm.status === 'active' ? ' and set as active' : ''}`)
      setSprintOpen(false)
      setSprintForm({ name: "", goal: "", startDate: "", endDate: "", projectId: "", status: "active" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create sprint")
    } finally {
      setCreatingSprint(false)
    }
  }

  // ── Row renderer ───────────────────────────────────────────────────────────

  const renderRow = (task: (typeof tasks)[0], isInSprint: boolean) => {
    const TypeIcon = typeIcons[task.type] ?? CheckSquare
    const assignee = users.find((u) => u.id === task.assigneeId)
    const pb = priorityBadge[task.priority] ?? priorityBadge.medium
    const sb = statusBadge[task.status] ?? statusBadge["todo"]

    return (
      <div
        key={task.id}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 border-b border-border/50 last:border-0 group transition-colors"
      >
        {/* Type icon */}
        <TypeIcon className={cn("size-4 shrink-0", typeColors[task.type])} />

        {/* Title */}
        <span className="flex-1 text-sm font-medium text-foreground truncate min-w-0">
          {task.title}
        </span>

        {/* Priority badge */}
        <Badge
          variant="outline"
          className={cn("text-xs shrink-0 hidden sm:inline-flex", pb.className)}
        >
          {pb.label}
        </Badge>

        {/* Story points */}
        <span className="text-xs font-medium text-muted-foreground w-10 text-center shrink-0 hidden md:block">
          {task.storyPoints > 0 ? `${task.storyPoints}pt` : "—"}
        </span>

        {/* Assignee avatar */}
        {assignee ? (
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-6 rounded-full border-2 border-dashed border-border shrink-0" />
        )}

        {/* Status badge */}
        <Badge
          variant="outline"
          className={cn("text-xs shrink-0 hidden lg:inline-flex", sb.className)}
        >
          {sb.label}
        </Badge>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {!isInSprint && activeSprintId && (
              <DropdownMenuItem onClick={() => handleMoveToSprint(task.id)}>
                <ArrowRight className="size-4 mr-2" />
                Move to Sprint
              </DropdownMenuItem>
            )}
            {!isInSprint && activeSprintId && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteId(task.id)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 h-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Type filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-32 text-xs gap-1">
                  <Filter className="size-3 shrink-0" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-8 w-32 text-xs gap-1">
                  <ArrowUpDown className="size-3 shrink-0" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                if (!currentUserId) { toast.error("Sign in to create a sprint"); return }
                setSprintOpen(true)
              }}>
                <Zap className="size-4 mr-1" />
                New Sprint
              </Button>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4 mr-1" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Sprint Backlog section */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap className="size-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Sprint Backlog
                  {activeSprint && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      — {activeSprint.name}
                    </span>
                  )}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {filteredSprint.length}
                </Badge>
              </div>
              {activeSprint && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {activeSprint.startDate} — {activeSprint.endDate}
                </span>
              )}
            </div>

            {!activeSprintId ? (
              <div className="px-4 py-10 text-center space-y-3">
                <Package className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No active sprint</p>
                <p className="text-xs text-muted-foreground/70">
                  Create a sprint to start planning your team&apos;s work
                </p>
                <Button size="sm" variant="outline" onClick={() => setSprintOpen(true)}>
                  <Zap className="size-3.5 mr-1.5" />
                  Create Sprint
                </Button>
              </div>
            ) : filteredSprint.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <InboxIcon className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  {sprintTasks.length === 0
                    ? "No tasks in this sprint yet"
                    : "No tasks match your filters"}
                </p>
              </div>
            ) : (
              <div>{filteredSprint.map((t) => renderRow(t, true))}</div>
            )}
          </div>

          {/* Product Backlog section */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Product Backlog</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredBacklog.length}
                </Badge>
              </div>
            </div>

            {filteredBacklog.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <InboxIcon className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  {backlogTasks.length === 0
                    ? "No unassigned tasks"
                    : "No tasks match your filters"}
                </p>
                {backlogTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    All tasks are assigned to a sprint, or create a new one
                  </p>
                )}
              </div>
            ) : (
              <div>{filteredBacklog.map((t) => renderRow(t, false))}</div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setForm(defaultForm) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement search autocomplete"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe what needs to be done..."
                className="resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as TaskType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Story points + Estimated hours */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="story-points">Story Points</Label>
                <Input
                  id="story-points"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.storyPoints}
                  onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select
                value={form.assigneeId || "unassigned"}
                onValueChange={(v) => setForm({ ...form, assigneeId: v === "unassigned" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add to sprint toggle */}
            {activeSprintId && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={form.addToSprint}
                  onClick={() => setForm({ ...form, addToSprint: !form.addToSprint })}
                  className={cn(
                    "size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    form.addToSprint
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {form.addToSprint && (
                    <svg viewBox="0 0 10 10" className="size-2.5 fill-current">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <Label
                  className="font-normal cursor-pointer"
                  onClick={() => setForm({ ...form, addToSprint: !form.addToSprint })}
                >
                  Add to current sprint
                  {activeSprint && (
                    <span className="text-muted-foreground ml-1">({activeSprint.name})</span>
                  )}
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setForm(defaultForm) }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sprint Dialog */}
      <Dialog open={sprintOpen} onOpenChange={(open) => { setSprintOpen(open); if (!open) setSprintForm({ name: "", goal: "", startDate: "", endDate: "", projectId: "", status: "active" }) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-name">Sprint Name <span className="text-destructive">*</span></Label>
              <Input
                id="sprint-name"
                placeholder="e.g. Sprint 4"
                value={sprintForm.name}
                onChange={e => setSprintForm({ ...sprintForm, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sprint-goal">Goal</Label>
              <Input
                id="sprint-goal"
                placeholder="What should the team achieve?"
                value={sprintForm.goal}
                onChange={e => setSprintForm({ ...sprintForm, goal: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sprint-start">Start Date <span className="text-destructive">*</span></Label>
                <Input
                  id="sprint-start"
                  type="date"
                  value={sprintForm.startDate}
                  onChange={e => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sprint-end">End Date <span className="text-destructive">*</span></Label>
                <Input
                  id="sprint-end"
                  type="date"
                  value={sprintForm.endDate}
                  onChange={e => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                />
              </div>
            </div>
            {projects.length > 1 && (
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={sprintForm.projectId || defaultProjectId} onValueChange={v => setSprintForm({ ...sprintForm, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={sprintForm.status} onValueChange={v => setSprintForm({ ...sprintForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active — start immediately</SelectItem>
                  <SelectItem value="planning">Planning — not started yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSprintOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSprint} disabled={creatingSprint}>
              {creatingSprint ? "Creating..." : "Create Sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
