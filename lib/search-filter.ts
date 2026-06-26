import { type Task, type Project, type Sprint } from "@/lib/mock-data"

export function searchTasks(tasks: Task[], query: string): Task[] {
  const lowerQuery = query.toLowerCase()
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery) ||
      task.labels.some((label) => label.toLowerCase().includes(lowerQuery))
  )
}

export function searchProjects(projects: Project[], query: string): Project[] {
  const lowerQuery = query.toLowerCase()
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.owner.toLowerCase().includes(lowerQuery)
  )
}

export function searchSprints(sprints: Sprint[], query: string): Sprint[] {
  const lowerQuery = query.toLowerCase()
  return sprints.filter(
    (sprint) =>
      sprint.name.toLowerCase().includes(lowerQuery) ||
      sprint.goal.toLowerCase().includes(lowerQuery)
  )
}

export function filterTasksByStatus(tasks: Task[], statuses: string[]): Task[] {
  return tasks.filter((task) => statuses.includes(task.status))
}

export function filterTasksByPriority(tasks: Task[], priorities: string[]): Task[] {
  return tasks.filter((task) => priorities.includes(task.priority))
}

export function filterTasksByAssignee(tasks: Task[], assigneeIds: string[]): Task[] {
  return tasks.filter((task) => assigneeIds.includes(task.assigneeId))
}

export function filterTasksBySprint(tasks: Task[], sprintId: string | null): Task[] {
  return tasks.filter((task) => task.sprintId === sprintId)
}

export function filterByDateRange(items: Array<{ dueDate?: string; startDate?: string; endDate?: string }>, startDate: string, endDate: string) {
  return items.filter((item) => {
    const itemDate = item.dueDate || item.startDate
    return itemDate && itemDate >= startDate && itemDate <= endDate
  })
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = new Date().toISOString().split("T")[0]
  return tasks.filter(
    (task) => task.dueDate < today && task.status !== "done" && task.status !== "blocked"
  )
}

export function getTasksByStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter((task) => task.status === status)
}
