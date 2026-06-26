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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  GripVertical,
  AlertTriangle,
  Bug,
  Zap,
  BookOpen,
  CheckSquare,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { tasks, users, type TaskType, type TaskPriority } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const typeIcons: Record<TaskType, React.ElementType> = {
  story: BookOpen,
  task: CheckSquare,
  bug: Bug,
  epic: Zap,
}

const typeColors: Record<TaskType, string> = {
  story: "text-primary",
  task: "text-muted-foreground",
  bug: "text-destructive",
  epic: "text-[oklch(0.45_0.16_295)]",
}

const priorityConfig: Record<TaskPriority, { label: string; dot: string }> = {
  low: { label: "Low", dot: "bg-muted-foreground" },
  medium: { label: "Medium", dot: "bg-primary" },
  high: { label: "High", dot: "bg-[oklch(0.74_0.16_80)]" },
  critical: { label: "Critical", dot: "bg-destructive" },
}

export function BacklogContent() {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: "", type: "story", priority: "medium", estimate: "", description: "" })

  const backlogItems = tasks.filter((t) => t.sprintId === null)
  const sprintItems = tasks.filter((t) => t.sprintId !== null)

  const filtered = (items: typeof tasks) =>
    items.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === "all" || t.type === filterType
      const matchPriority = filterPriority === "all" || t.priority === filterPriority
      return matchSearch && matchType && matchPriority
    })

  const handleCreate = () => {
    if (!form.title) { toast.error("Title is required"); return }
    toast.success(`"${form.title}" added to backlog`)
    setOpen(false)
    setForm({ title: "", type: "story", priority: "medium", estimate: "", description: "" })
  }

  const renderRow = (task: typeof tasks[0]) => {
    const TypeIcon = typeIcons[task.type]
    const assignee = users.find((u) => u.id === task.assigneeId)
    const pc = priorityConfig[task.priority]

    return (
      <div
        key={task.id}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 border-b border-border/50 last:border-0 cursor-pointer group transition-colors"
        onClick={() => toast.info(task.title)}
      >
        <GripVertical className="size-3.5 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground transition-colors" />
        <TypeIcon className={cn("size-4 shrink-0", typeColors[task.type])} />
        <span className="flex-1 text-sm font-medium text-foreground truncate">{task.title}</span>
        {task.isBlocked && (
          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30 shrink-0">
            <AlertTriangle className="size-3" />
            Blocked
          </Badge>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <span className={cn("size-2 rounded-full", pc.dot)} />
          {pc.label}
        </div>
        <span className="text-xs font-medium text-foreground w-12 text-center shrink-0 hidden sm:block">
          {task.storyPoints} pts
        </span>
        {assignee ? (
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{assignee.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-6 rounded-full border-2 border-dashed border-border shrink-0" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs shrink-0 hidden group-hover:flex"
          onClick={(e) => { e.stopPropagation(); toast.success("Added to sprint") }}
        >
          + Sprint
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search backlog items..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <Filter className="size-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <ArrowUpDown className="size-3 mr-1" />
                <SelectValue />
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
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Add Item
          </Button>
        </div>

        {/* Sprint items */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2">
              <Zap className="size-3.5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Sprint 4 — Active</span>
              <Badge variant="secondary" className="text-xs">{filtered(sprintItems).length} items</Badge>
            </div>
            <span className="text-xs text-muted-foreground">Jun 16 — Jun 27</span>
          </div>
          {filtered(sprintItems).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No items match filters</div>
          ) : (
            filtered(sprintItems).map(renderRow)
          )}
        </div>

        {/* Backlog */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Backlog</span>
              <Badge variant="secondary" className="text-xs">{filtered(backlogItems).length} items</Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Refinement mode")}>
              Refine
            </Button>
          </div>
          {filtered(backlogItems).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <p className="font-medium">No backlog items</p>
              <p className="text-xs mt-1">All stories are assigned to a sprint or filtered out</p>
            </div>
          ) : (
            filtered(backlogItems).map(renderRow)
          )}
        </div>
      </div>

      {/* Add item dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Backlog Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Implement search autocomplete"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
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
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
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
            <div className="space-y-1.5">
              <Label>Story Points</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.estimate}
                onChange={(e) => setForm({ ...form, estimate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what needs to be done..."
                className="resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add to Backlog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}
