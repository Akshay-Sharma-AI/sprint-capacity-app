import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client using service role key — server-side only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Send Supabase magic-link invite — user clicks link, sets password, lands on app
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sprint-capacity-m2b41aycc-akshaysharma17s-projects.vercel.app'}/`,
    })

    if (error) {
      // If user already exists, that's fine
      if (error.message.includes('already been registered')) {
        return NextResponse.json({ message: 'User already has an account' })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Pre-create their workspace membership so they're in the team immediately
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .limit(1)
      .single()

    if (workspace && data.user) {
      await supabaseAdmin.from('workspace_members').upsert({
        workspace_id: workspace.id,
        user_id: data.user.id,
        role: 'member',
      }, { onConflict: 'workspace_id,user_id' })

      await supabaseAdmin.from('users').upsert({
        id: data.user.id,
        workspace_id: workspace.id,
        email: email,
        full_name: email.split('@')[0],
        role: 'member',
        availability_status: 'available',
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ message: `Invite sent to ${email}` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
