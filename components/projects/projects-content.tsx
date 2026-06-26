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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Calendar,
  Users,
  Zap,
  MoreHorizontal,
  FolderKanban,
  TrendingUp,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { projects, users, type ProjectStatus } from "@/lib/mock-data"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[oklch(0.62_0.15_148/0.1)] text-[oklch(0.42_0.15_148)] border-[oklch(0.62_0.15_148/0.3)]" },
  planning: { label: "Planning", className: "bg-primary/10 text-primary border-primary/30" },
  "on-hold": { label: "On Hold", className: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]" },
  completed: { label: "Completed", className: "bg-secondary text-secondary-foreground border-border" },
}

export function ProjectsContent() {
  const [open, setOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", owner: "", endDate: "" })

  const handleCreate = () => {
    if (!newProject.name) { toast.error("Project name is required"); return }
    toast.success(`Project "${newProject.name}" created`)
    setOpen(false)
    setNewProject({ name: "", owner: "", endDate: "" })
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{projects.length} projects</span>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            New Project
          </Button>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const owner = users.find((u) => u.id === project.ownerId)
            const statusCfg = statusConfig[project.status]
            return (
              <Card key={project.id} className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
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
                        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("Opening project settings")}>Settings</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Viewing sprints")}>View Sprints</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.warning("Project archived")} className="text-destructive">Archive</DropdownMenuItem>
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

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium text-foreground">{project.completionPercentage}%</span>
                    </div>
                    <Progress value={project.completionPercentage} className="h-1.5" />
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{owner?.initials}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{project.owner}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3" />
                      {project.teamSize} members
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Calendar className="size-3" />
                      <span>
                        {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" — "}
                        {new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => toast.info(`Opening ${project.name}`)}
                  >
                    <TrendingUp className="size-3" data-icon="inline-start" />
                    View Project
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g. Platform v3 Migration"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-owner">Project Owner</Label>
              <Input
                id="project-owner"
                placeholder="Search team members..."
                value={newProject.owner}
                onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date">Target End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}
