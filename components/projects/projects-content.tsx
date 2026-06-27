"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus, Calendar, Users, Zap, MoreHorizontal, FolderKanban, TrendingUp, Trash2, Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAppContext } from "@/context/app-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/mock-data"

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[oklch(0.62_0.15_148/0.1)] text-[oklch(0.42_0.15_148)] border-[oklch(0.62_0.15_148/0.3)]" },
  planning: { label: "Planning", className: "bg-primary/10 text-primary border-primary/30" },
  "on-hold": { label: "On Hold", className: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]" },
  completed: { label: "Completed", className: "bg-secondary text-secondary-foreground border-border" },
}

export function ProjectsContent() {
  const { projects, users, currentUserId, createProject, deleteProject, loading } = useAppContext()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({ name: "", description: "", leadId: "", status: "active" })

  const handleCreate = async () => {
    if (!newProject.name.trim()) { toast.error("Project name is required"); return }
    if (!currentUserId) { toast.error("Sign in to create a project"); return }
    setSaving(true)
    try {
      await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        status: (newProject.status as any) || 'active',
        owner: '',
        ownerId: newProject.leadId || currentUserId || '',
        startDate: '',
        endDate: '',
        currentSprint: '',
        teamSize: 0,
        completionPercentage: 0,
      })
      toast.success(`Project "${newProject.name}" created`)
      setOpen(false)
      setNewProject({ name: "", description: "", leadId: "", status: "active" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProject(deleteId)
      toast.success("Project deleted")
    } catch {
      toast.error("Failed to delete project")
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          <Button size="sm" onClick={() => {
            if (!currentUserId) { toast.error("Sign in to create a project"); return }
            setOpen(true)
          }}>
            <Plus data-icon="inline-start" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderKanban className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create your first project to get started</p>
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <Plus data-icon="inline-start" /> New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const owner = users.find(u => u.id === project.ownerId)
              const statusCfg = statusConfig[project.status] || statusConfig.active
              return (
                <Card key={project.id} className="hover:border-primary/40 hover:shadow-sm transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary shrink-0">
                          <FolderKanban className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{project.description || 'No description'}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                          <MoreHorizontal className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(project.id)}
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", statusCfg.className)}>
                        {statusCfg.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Zap className="size-3" />
                        {project.currentSprint}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium text-foreground">{project.completionPercentage}%</span>
                      </div>
                      <Progress value={project.completionPercentage} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {owner?.initials || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{project.owner || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3" />
                        {project.teamSize} member{project.teamSize !== 1 ? 's' : ''}
                      </div>
                      {project.startDate && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Calendar className="size-3" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {project.endDate && ` — ${new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="w-full text-xs h-7">
                      <TrendingUp className="size-3" data-icon="inline-start" />
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g. Platform v3 Migration"
                value={newProject.name}
                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                placeholder="What is this project about?"
                rows={2}
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Project Lead</Label>
              <Select value={newProject.leadId} onValueChange={v => setNewProject({ ...newProject, leadId: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select a lead (optional)" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="text-sm">{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={newProject.status} onValueChange={v => setNewProject({ ...newProject, status: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning" className="text-sm">Planning</SelectItem>
                  <SelectItem value="active" className="text-sm">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="size-3.5 mr-2 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its sprints and tasks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  )
}
