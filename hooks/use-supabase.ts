'use client'

import { useState, useEffect, useCallback } from 'react'
import * as queries from '@/lib/supabase/queries'

export function useProjects(workspaceId: string) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getProjects(workspaceId)
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { projects, loading, error, refetch: fetch }
}

export function useSprints(workspaceId: string) {
  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getSprints(workspaceId)
      setSprints(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sprints'))
      setSprints([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { sprints, loading, error, refetch: fetch }
}

export function useTasks(workspaceId: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getTasks(workspaceId)
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { tasks, loading, error, refetch: fetch }
}

export function useTasksBySprint(sprintId: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getTasksBySprint(sprintId)
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { tasks, loading, error, refetch: fetch }
}

export function useCapacities(sprintId: string) {
  const [capacities, setCapacities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getCapacities(sprintId)
      setCapacities(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch capacities'))
      setCapacities([])
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { capacities, loading, error, refetch: fetch }
}

export function useDailyUpdates(sprintId: string) {
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getDailyUpdates(sprintId)
      setUpdates(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch daily updates'))
      setUpdates([])
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { updates, loading, error, refetch: fetch }
}

export function useWorkspaceUsers(workspaceId: string) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await queries.getWorkspaceUsers(workspaceId)
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { users, loading, error, refetch: fetch }
}
