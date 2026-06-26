'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Projects
export async function getProjects(workspaceId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
  
  if (error) throw error
  return data
}

export async function createProject(workspaceId: string, projectData: any) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ workspace_id: workspaceId, ...projectData })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProject(projectId: string, updates: any) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
  
  if (error) throw error
}

// Sprints
export async function getSprints(workspaceId: string) {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getSprintsByProject(projectId: string) {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', projectId)
    .order('start_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createSprint(workspaceId: string, sprintData: any) {
  const { data, error } = await supabase
    .from('sprints')
    .insert({ workspace_id: workspaceId, ...sprintData })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateSprint(sprintId: string, updates: any) {
  const { data, error } = await supabase
    .from('sprints')
    .update(updates)
    .eq('id', sprintId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Tasks
export async function getTasks(workspaceId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTasksBySprint(sprintId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('status', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getTasksByAssignee(workspaceId: string, assigneeId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('assignee_id', assigneeId)
    .order('due_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createTask(workspaceId: string, taskData: any) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ workspace_id: workspaceId, ...taskData })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTask(taskId: string, updates: any) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
}

// Capacities
export async function getCapacities(sprintId: string) {
  const { data, error } = await supabase
    .from('capacities')
    .select('*')
    .eq('sprint_id', sprintId)
  
  if (error) throw error
  return data
}

export async function getUserCapacity(sprintId: string, userId: string) {
  const { data, error } = await supabase
    .from('capacities')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is not found error
  return data
}

export async function createCapacity(workspaceId: string, capacityData: any) {
  const { data, error } = await supabase
    .from('capacities')
    .insert({ workspace_id: workspaceId, ...capacityData })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCapacity(capacityId: string, updates: any) {
  const { data, error } = await supabase
    .from('capacities')
    .update(updates)
    .eq('id', capacityId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Daily Updates
export async function getDailyUpdates(sprintId: string) {
  const { data, error } = await supabase
    .from('daily_updates')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getUserDailyUpdate(sprintId: string, userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_updates')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createDailyUpdate(workspaceId: string, updateData: any) {
  const { data, error } = await supabase
    .from('daily_updates')
    .insert({ workspace_id: workspaceId, ...updateData })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDailyUpdate(updateId: string, updates: any) {
  const { data, error } = await supabase
    .from('daily_updates')
    .update(updates)
    .eq('id', updateId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Users
export async function getWorkspaceUsers(workspaceId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('workspace_id', workspaceId)
  
  if (error) throw error
  return data
}

export async function getCurrentUserProfile(workspaceId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}
