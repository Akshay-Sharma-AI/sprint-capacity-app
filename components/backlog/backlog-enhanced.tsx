"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/context/app-context"
import { useModals } from "@/hooks/use-modals"
import { searchTasks, filterTasksByStatus, filterTasksByPriority, getOverdueTasks } from "@/lib/search-filter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTaskModal } from "@/components/modals/create-task-modal"
import { LogHoursModal } from "@/components/modals/log-hours-modal"
import { BlockTaskModal } from "@/components/modals/block-task-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { TaskCard } from "@/components/task-card"
import { Plus, Search, Trash2, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface BacklogEnhancedProps {
  projectId: string
}

const statusTabs = ["all", "todo", "in-progress", "in-review", "qa", "done", "blocked"] as const

export function BacklogEnhanced({ projectId }: BacklogEnhancedProps) {
  const { tasks, deleteTask, projects } = useApp()
  const { modals, selectedTask, setSelectedTask, openModal, closeModal, openDeleteConfirmation, closeDeleteConfirmation } = useModals()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<(typeof statusTabs)[number]>("all")
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["low", "medium", "high", "critical"])

  const project = projects.find((p) => p.id === projectId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  // Filter tasks based on search, status, and priority
  const filteredTasks = useMemo(() => {
    let result = projectTasks

    // Search
    if (searchQuery) {
      result = searchTasks(result, searchQuery)
    }

    // Status filter
    if (activeStatus !== "all") {
      result = filterTasksByStatus(result, [activeStatus])
    }

    // Priority filter
    result = filterTasksByPriority(result, selectedPriorities)

    return result
  }, [projectTasks, searchQuery, activeStatus, selectedPriorities])

  const overdueTasks = getOverdueTasks(filteredTasks)

  const handleDeleteTask = () => {
    if (modals.deleteConfirmation.id) {
      deleteTask(modals.deleteConfirmation.id)
      toast.success("Task deleted")
      closeDeleteConfirmation()
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Project Backlog</h2>
            <p className="text-sm text-muted-foreground">{project?.name || "Unknown Project"}</p>
          </div>
          <Button onClick={() => openModal("createTask")} className="gap-2">
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <div className="text-sm font-medium mb-2">Priority Filter</div>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high", "critical"].map((p) => (
                  <Badge
                    key={p}
                    variant={selectedPriorities.includes(p) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedPriorities((prev) =>
                        prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                      )
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {overdueTasks.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="text-sm font-medium">{overdueTasks.length} overdue task(s)</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks by Status */}
        <Tabs value={activeStatus} onValueChange={(v) => setActiveStatus(v as (typeof statusTabs)[number])}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {statusTabs.map((status) => (
              <TabsTrigger key={status} value={status} className="capitalize">
                {status === "all" ? "All" : status.replace("-", " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          {statusTabs.map((status) => (
            <TabsContent key={status} value={status} className="space-y-3">
              <ScrollArea className="h-[600px] rounded-md border p-4">
                {filteredTasks
                  .filter((t) => activeStatus === "all" || t.status === activeStatus)
                  .length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">No tasks found</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks
                      .filter((t) => activeStatus === "all" || t.status === activeStatus)
                      .map((task) => (
                        <div key={task.id} className="group relative">
                          <TaskCard task={task} />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedTask(task)
                                openModal("logHours")
                              }}
                              title="Log hours"
                            >
                              <Clock className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteConfirmation("task", task.id, task.title)}
                              title="Delete task"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Modals */}
      <CreateTaskModal
        open={modals.createTask}
        onOpenChange={(open) => (open ? openModal("createTask") : closeModal("createTask"))}
        projectId={projectId}
      />

      <LogHoursModal
        open={modals.logHours}
        onOpenChange={(open) => (open ? openModal("logHours") : closeModal("logHours"))}
        task={selectedTask}
      />

      <BlockTaskModal
        open={modals.blockTask}
        onOpenChange={(open) => (open ? openModal("blockTask") : closeModal("blockTask"))}
        task={selectedTask}
      />

      <DeleteConfirmationModal
        open={modals.deleteConfirmation.open}
        onOpenChange={(open) => (open ? null : closeDeleteConfirmation())}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        itemName={modals.deleteConfirmation.name}
        onConfirm={handleDeleteTask}
      />
    </>
  )
}
