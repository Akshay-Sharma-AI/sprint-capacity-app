"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  User,
  Project,
  Sprint,
  Task,
  Capacity,
  DailyUpdate,
} from "@/lib/mock-data"

interface AppContextType {
  currentUserId: string | null
  workspaceId: string | null
  users: User[]
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  capacities: Capacity[]
  dailyUpdates: DailyUpdate[]
  loading: boolean
  createProject: (project: Omit<Project, "id">) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  createSprint: (sprint: Omit<Sprint, "id">) => Promise<void>
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>
  deleteSprint: (id: string) => Promise<void>
  createTask: (task: Omit<Task, "id">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateCapacity: (userId: string, sprintId: string, updates: Partial<Capacity>) => Promise<void>
  createDailyUpdate: (update: Omit<DailyUpdate, "id">) => Promise<void>
  updateDailyUpdate: (id: string, updates: Partial<DailyUpdate>) => Promise<void>
  deleteDailyUpdate: (id: string) => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeSprintId: string | null
  setActiveSprintId: (id: string | null) => void
  refresh: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function mapUser(row: any): User {
  const name = row.full_name || row.email?.split('@')[0] || 'Unknown'
  const words = name.trim().split(' ')
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return {
    id: row.id,
    name,
    email: row.email,
    avatar: row.avatar_url || '',
    initials,
    role: row.role || 'member',
    team: '',
    dailyCapacityHours: 8,
    availabilityStatus: row.availability_status || 'available',
  }
}

function mapSprint(row: any): Sprint {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    goal: row.goal || '',
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    committedStoryPoints: row.committed_story_points || 0,
    completedStoryPoints: row.completed_story_points || 0,
  }
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    sprintId: row.sprint_id || null,
    title: row.title,
    description: row.description || '',
    type: row.type || 'task',
    priority: row.priority || 'medium',
    status: row.status || 'todo',
    assigneeId: row.assignee_id || '',
    storyPoints: row.story_points || 0,
    estimatedHours: row.estimated_hours || 0,
    loggedHours: row.logged_hours || 0,
    remainingHours: row.remaining_hours || 0,
    dueDate: row.due_date || '',
    isBlocked: row.is_blocked || false,
    blockerReason: row.blocker_reason || '',
    comments: row.comments_count || 0,
    labels: [],
  }
}

function mapProject(row: any, users: User[], sprints: Sprint[], tasks: Task[]): Project {
  const lead = users.find(u => u.id === row.lead_id)
  const activeSprint = sprints.find(s => s.projectId === row.id && s.status === 'active')
  const projectTasks = tasks.filter(t => t.projectId === row.id)
  const done = projectTasks.filter(t => t.status === 'done').length
  const completion = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0
  return {
    id: row.id,
    name: row.name,
    owner: lead?.name || 'Unknown',
    ownerId: row.lead_id,
    status: row.status || 'active',
    startDate: activeSprint?.startDate || row.created_at?.slice(0, 10) || '',
    endDate: activeSprint?.endDate || '',
    currentSprint: activeSprint?.name || 'No active sprint',
    teamSize: users.length,
    completionPercentage: completion,
    description: row.description || '',
  }
}

function mapCapacity(row: any): Capacity {
  const remaining = (row.total_available_hours || 0) - (row.allocated_hours || 0)
  const util = row.total_available_hours > 0
    ? Math.round(((row.allocated_hours || 0) / row.total_available_hours) * 100)
    : 0
  return {
    userId: row.user_id,
    sprintId: row.sprint_id,
    availableDays: 10,
    dailyCapacityHours: (row.total_available_hours || 80) / 10,
    leaveHours: 0,
    totalAvailableHours: row.total_available_hours || 0,
    allocatedHours: row.allocated_hours || 0,
    remainingHours: remaining,
    utilizationPercentage: util,
    status: row.status || 'available',
  }
}

function mapDailyUpdate(row: any): DailyUpdate {
  return {
    id: row.id,
    userId: row.user_id,
    taskId: '',
    date: row.date,
    workedOn: row.yesterday_completed || '',
    nextPlan: row.today_planned || '',
    blockers: row.blockers || '',
    hoursLogged: 0,
    mood: row.mood === 'great' || row.mood === 'good' ? 'good'
        : row.mood === 'challenging' || row.mood === 'struggling' ? 'stuck'
        : 'neutral',
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [capacities, setCapacities] = useState<Capacity[]>([])
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)

    // Load current user if logged in (optional — app is publicly viewable)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    // Get the shared workspace (first one — single-tenant team setup)
    const { data: workspaceRow } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1)
      .single()

    if (!workspaceRow) { setLoading(false); return }
    const wid = workspaceRow.id
    setWorkspaceId(wid)

    const [usersRes, projectsRes, sprintsRes, tasksRes, capsRes, updatesRes] =
      await Promise.all([
        supabase.from('users').select('*').eq('workspace_id', wid),
        supabase.from('projects').select('*').eq('workspace_id', wid),
        supabase.from('sprints').select('*').eq('workspace_id', wid).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('workspace_id', wid).order('created_at', { ascending: false }),
        supabase.from('capacities').select('*').eq('workspace_id', wid),
        supabase.from('daily_updates').select('*').eq('workspace_id', wid).order('date', { ascending: false }),
      ])

    const mappedUsers = (usersRes.data || []).map(mapUser)
    const mappedSprints = (sprintsRes.data || []).map(mapSprint)
    const mappedTasks = (tasksRes.data || []).map(mapTask)
    const mappedProjects = (projectsRes.data || []).map(r =>
      mapProject(r, mappedUsers, mappedSprints, mappedTasks)
    )

    setUsers(mappedUsers)
    setSprints(mappedSprints)
    setTasks(mappedTasks)
    setProjects(mappedProjects)
    setCapacities((capsRes.data || []).map(mapCapacity))
    setDailyUpdates((updatesRes.data || []).map(mapDailyUpdate))

    const active = mappedSprints.find(s => s.status === 'active')
    if (active) setActiveSprintId(active.id)

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Projects ──────────────────────────────────────────────────────────────

  const createProject = useCallback(async (project: Omit<Project, "id">) => {
    if (!workspaceId || !currentUserId) return
    const { data, error } = await supabase.from('projects').insert({
      workspace_id: workspaceId,
      name: project.name,
      description: project.description || '',
      lead_id: currentUserId,
      status: project.status || 'active',
    }).select().single()
    if (error) throw error
    setProjects(prev => [...prev, mapProject(data, users, sprints, tasks)])
  }, [workspaceId, currentUserId, users, sprints, tasks])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase.from('projects')
      .update({ name: updates.name, description: updates.description, status: updates.status })
      .eq('id', id).select().single()
    if (error) throw error
    setProjects(prev => prev.map(p => p.id === id ? mapProject(data, users, sprints, tasks) : p))
  }, [users, sprints, tasks])

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    setProjects(prev => prev.filter(p => p.id !== id))
    setSprints(prev => prev.filter(s => s.projectId !== id))
    setTasks(prev => prev.filter(t => t.projectId !== id))
  }, [])

  // ── Sprints ───────────────────────────────────────────────────────────────

  const createSprint = useCallback(async (sprint: Omit<Sprint, "id">) => {
    if (!workspaceId) return
    const { data, error } = await supabase.from('sprints').insert({
      workspace_id: workspaceId,
      project_id: sprint.projectId,
      name: sprint.name,
      goal: sprint.goal || '',
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      status: sprint.status || 'planning',
      committed_story_points: sprint.committedStoryPoints || 0,
      completed_story_points: 0,
    }).select().single()
    if (error) throw error
    setSprints(prev => [mapSprint(data), ...prev])
  }, [workspaceId])

  const updateSprint = useCallback(async (id: string, updates: Partial<Sprint>) => {
    const { data, error } = await supabase.from('sprints').update({
      name: updates.name,
      goal: updates.goal,
      start_date: updates.startDate,
      end_date: updates.endDate,
      status: updates.status,
      committed_story_points: updates.committedStoryPoints,
      completed_story_points: updates.completedStoryPoints,
    }).eq('id', id).select().single()
    if (error) throw error
    setSprints(prev => prev.map(s => s.id === id ? mapSprint(data) : s))
  }, [])

  const deleteSprint = useCallback(async (id: string) => {
    const { error } = await supabase.from('sprints').delete().eq('id', id)
    if (error) throw error
    setSprints(prev => prev.filter(s => s.id !== id))
    setTasks(prev => prev.map(t => t.sprintId === id ? { ...t, sprintId: null } : t))
  }, [])

  // ── Tasks ─────────────────────────────────────────────────────────────────

  const createTask = useCallback(async (task: Omit<Task, "id">) => {
    if (!workspaceId || !currentUserId) return
    const { data, error } = await supabase.from('tasks').insert({
      workspace_id: workspaceId,
      project_id: task.projectId,
      sprint_id: task.sprintId || null,
      title: task.title,
      description: task.description || '',
      type: task.type || 'task',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignee_id: task.assigneeId || null,
      story_points: task.storyPoints || 0,
      estimated_hours: task.estimatedHours || 0,
      logged_hours: 0,
      remaining_hours: task.estimatedHours || 0,
      due_date: task.dueDate || null,
      is_blocked: false,
      created_by: currentUserId,
    }).select().single()
    if (error) throw error
    setTasks(prev => [mapTask(data), ...prev])
  }, [workspaceId, currentUserId])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      assignee_id: updates.assigneeId,
      story_points: updates.storyPoints,
      estimated_hours: updates.estimatedHours,
      logged_hours: updates.loggedHours,
      remaining_hours: updates.remainingHours,
      sprint_id: updates.sprintId,
      due_date: updates.dueDate,
      is_blocked: updates.isBlocked,
      blocker_reason: updates.blockerReason,
    }).eq('id', id).select().single()
    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? mapTask(data) : t))
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Capacities ────────────────────────────────────────────────────────────

  const updateCapacity = useCallback(async (userId: string, sprintId: string, updates: Partial<Capacity>) => {
    if (!workspaceId) return
    const exists = capacities.some(c => c.userId === userId && c.sprintId === sprintId)
    let data: any
    let error: any
    if (exists) {
      ({ data, error } = await supabase.from('capacities')
        .update({ total_available_hours: updates.totalAvailableHours, allocated_hours: updates.allocatedHours })
        .eq('sprint_id', sprintId).eq('user_id', userId).select().single())
      if (error) throw error
      setCapacities(prev => prev.map(c =>
        c.userId === userId && c.sprintId === sprintId ? mapCapacity(data) : c
      ))
    } else {
      ({ data, error } = await supabase.from('capacities').insert({
        workspace_id: workspaceId,
        sprint_id: sprintId,
        user_id: userId,
        total_available_hours: updates.totalAvailableHours || 0,
        allocated_hours: updates.allocatedHours || 0,
        status: 'available',
      }).select().single())
      if (error) throw error
      setCapacities(prev => [...prev, mapCapacity(data)])
    }
  }, [workspaceId, capacities])

  // ── Daily Updates ─────────────────────────────────────────────────────────

  const createDailyUpdate = useCallback(async (update: Omit<DailyUpdate, "id">) => {
    if (!workspaceId || !currentUserId || !activeSprintId) return
    const { data, error } = await supabase.from('daily_updates').insert({
      workspace_id: workspaceId,
      sprint_id: activeSprintId,
      user_id: update.userId || currentUserId,
      date: update.date,
      mood: update.mood === 'good' ? 'good' : update.mood === 'stuck' ? 'challenging' : 'okay',
      yesterday_completed: update.workedOn,
      today_planned: update.nextPlan,
      blockers: update.blockers,
    }).select().single()
    if (error) throw error
    setDailyUpdates(prev => [mapDailyUpdate(data), ...prev])
  }, [workspaceId, currentUserId, activeSprintId])

  const updateDailyUpdate = useCallback(async (id: string, updates: Partial<DailyUpdate>) => {
    const { data, error } = await supabase.from('daily_updates').update({
      yesterday_completed: updates.workedOn,
      today_planned: updates.nextPlan,
      blockers: updates.blockers,
      mood: updates.mood === 'good' ? 'good' : updates.mood === 'stuck' ? 'challenging' : 'okay',
    }).eq('id', id).select().single()
    if (error) throw error
    setDailyUpdates(prev => prev.map(u => u.id === id ? mapDailyUpdate(data) : u))
  }, [])

  const deleteDailyUpdate = useCallback(async (id: string) => {
    const { error } = await supabase.from('daily_updates').delete().eq('id', id)
    if (error) throw error
    setDailyUpdates(prev => prev.filter(u => u.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      currentUserId, workspaceId,
      users, projects, sprints, tasks, capacities, dailyUpdates, loading,
      createProject, updateProject, deleteProject,
      createSprint, updateSprint, deleteSprint,
      createTask, updateTask, deleteTask,
      updateCapacity,
      createDailyUpdate, updateDailyUpdate, deleteDailyUpdate,
      searchQuery, setSearchQuery,
      activeSprintId, setActiveSprintId,
      refresh: loadData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}

// Alias for components that use useAppContext
export const useAppContext = useApp
