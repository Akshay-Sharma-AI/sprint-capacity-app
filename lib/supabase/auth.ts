'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) throw error

    // Initialize workspace and user profile
    if (data.user) {
      await supabase.rpc('init_user_workspace', {
        p_user_id: data.user.id,
        p_email: email,
        p_full_name: fullName,
      })
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Ensure profile exists (handles users created before this migration)
    if (data.user) {
      const fullName = data.user.user_metadata?.full_name || email.split('@')[0]
      await supabase.rpc('init_user_workspace', {
        p_user_id: data.user.id,
        p_email: email,
        p_full_name: fullName,
      })
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch {
    return null
  }
}
