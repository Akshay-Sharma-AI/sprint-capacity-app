"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import {
  projects as defaultProjects,
  sprints as defaultSprints,
  tasks as defaultTasks,
  capacities as defaultCapacities,
  dailyUpdates as defaultDailyUpdates,
  users as defaultUsers,
  type Project,
  type Sprint,
  type Task,
  type Capacity,
  type DailyUpdate,
  type User,
} from "@/lib/mock-data"

interface AppContextType {
  // Users
  users: User[]

  // Projects
  projects: Project[]
  createProject: (project: Omit<Project, "id">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Sprints
  sprints: Sprint[]
  createSprint: (sprint: Omit<Sprint, "id">) => void
  updateSprint: (id: string, updates: Partial<Sprint>) => void
  deleteSprint: (id: string) => void

  // Tasks
  tasks: Task[]
  createTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Capacities
  capacities: Capacity[]
  updateCapacity: (userId: string, sprintId: string, updates: Partial<Capacity>) => void

  // Daily Updates
  dailyUpdates: DailyUpdate[]
  createDailyUpdate: (update: Omit<DailyUpdate, "id">) => void
  updateDailyUpdate: (id: string, updates: Partial<DailyUpdate>) => void
  deleteDailyUpdate: (id: string) => void

  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeSprintId: string | null
  setActiveSprintId: (id: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users] = useState<User[]>(defaultUsers)
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [sprints, setSprints] = useState<Sprint[]>(defaultSprints)
  const [tasks, setTasks] = useState<Task[]>(defaultTasks)
  const [capacities, setCapacities] = useState<Capacity[]>(defaultCapacities)
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>(defaultDailyUpdates)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null)

  // Project operations
  const createProject = useCallback((project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: `p${Date.now()}`,
    }
    setProjects((prev) => [...prev, newProject])
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setSprints((prev) => prev.filter((s) => s.projectId !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
  }, [])

  // Sprint operations
  const createSprint = useCallback((sprint: Omit<Sprint, "id">) => {
    const newSprint: Sprint = {
      ...sprint,
      id: `s${Date.now()}`,
    }
    setSprints((prev) => [...prev, newSprint])
  }, [])

  const updateSprint = useCallback((id: string, updates: Partial<Sprint>) => {
    setSprints((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const deleteSprint = useCallback((id: string) => {
    setSprints((prev) => prev.filter((s) => s.id !== id))
    setTasks((prev) => prev.filter((t) => t.sprintId !== id))
  }, [])

  // Task operations
  const createTask = useCallback((task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
    }
    setTasks((prev) => [...prev, newTask])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setDailyUpdates((prev) => prev.filter((d) => d.taskId !== id))
  }, [])

  // Capacity operations
  const updateCapacity = useCallback((userId: string, sprintId: string, updates: Partial<Capacity>) => {
    setCapacities((prev) =>
      prev.map((c) =>
        c.userId === userId && c.sprintId === sprintId ? { ...c, ...updates } : c
      )
    )
  }, [])

  // Daily Update operations
  const createDailyUpdate = useCallback((update: Omit<DailyUpdate, "id">) => {
    const newUpdate: DailyUpdate = {
      ...update,
      id: `d${Date.now()}`,
    }
    setDailyUpdates((prev) => [...prev, newUpdate])
  }, [])

  const updateDailyUpdate = useCallback((id: string, updates: Partial<DailyUpdate>) => {
    setDailyUpdates((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }, [])

  const deleteDailyUpdate = useCallback((id: string) => {
    setDailyUpdates((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const value: AppContextType = useMemo(
    () => ({
      users,
      projects,
      createProject,
      updateProject,
      deleteProject,
      sprints,
      createSprint,
      updateSprint,
      deleteSprint,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      capacities,
      updateCapacity,
      dailyUpdates,
      createDailyUpdate,
      updateDailyUpdate,
      deleteDailyUpdate,
      searchQuery,
      setSearchQuery,
      activeSprintId,
      setActiveSprintId,
    }),
    [
      users,
      projects,
      createProject,
      updateProject,
      deleteProject,
      sprints,
      createSprint,
      updateSprint,
      deleteSprint,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      capacities,
      updateCapacity,
      dailyUpdates,
      createDailyUpdate,
      updateDailyUpdate,
      deleteDailyUpdate,
      searchQuery,
      activeSprintId,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
