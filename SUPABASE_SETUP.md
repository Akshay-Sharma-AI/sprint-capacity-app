# SprintCapacity Supabase Integration Guide

## Overview

SprintCapacity now includes full Supabase integration with authentication, database persistence, and role-based access control (RBAC). This guide walks you through setting up and configuring Supabase for your SprintCapacity instance.

## Prerequisites

- Vercel project deployed
- Supabase account (free tier is sufficient to start)
- Basic knowledge of environment variables

## Step 1: Create a Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: SprintCapacity
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for initialization (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings → API**
2. Copy these two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Set Environment Variables

### In Vercel Dashboard:

1. Go to your SprintCapacity project
2. Click **Settings → Environment Variables**
3. Add two new variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. Save and redeploy

### For Local Development (.env.local):

Create `.env.local` in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_init_schema.sql`
4. Paste into the SQL editor
5. Click "Run" and wait for completion

The migration creates:
- 8 main tables (workspaces, users, projects, sprints, tasks, capacities, daily_updates)
- Row-level security (RLS) policies for multi-tenant isolation
- Proper indexes for performance
- Role-based access control (admin, manager, member)

## Step 5: Configure Authentication

### Email/Password Auth (Default)

1. Go to **Authentication → Providers** in Supabase
2. Ensure **Email** is enabled (it is by default)
3. Configure email settings if needed in **Email Templates**

### Optional: Add OAuth

1. Go to **Authentication → Providers**
2. Enable desired providers (Google, GitHub, etc.)
3. Add OAuth credentials from provider dashboards

## Step 6: Test the Integration

1. Navigate to your deployed SprintCapacity app
2. Click "Sign Up"
3. Create a test account
4. Verify email if required
5. Log in with your credentials
6. You should now see the dashboard with Supabase data persistence enabled

## Step 7: Check Database Connection (Optional)

In Settings → Database tab, you should see:
- Green checkmark indicating Supabase is connected
- Your configuration URL displayed
- List of database tables

## Architecture Overview

### Database Schema

```
workspaces (Root entity for multi-tenancy)
├── workspace_members (User-workspace associations with roles)
├── users (User profiles within workspace)
├── projects (Team projects)
│   └── sprints (Sprint planning)
│       ├── tasks (Individual work items)
│       ├── capacities (Team member availability)
│       └── daily_updates (Standup notes)
```

### Authentication Flow

1. **Sign Up** → Creates auth user + profile in `users` table
2. **Sign In** → Verifies credentials via Supabase Auth
3. **Protected Routes** → Middleware checks session validity
4. **Auto-logout** → Session expires after 1 week (configurable)

### Role-Based Access

Three roles per workspace:

| Role | Permissions |
|------|------------|
| **Admin** | Full access, manage team, delete workspace |
| **Manager** | Create projects/sprints, assign tasks, view reports |
| **Member** | View tasks, log hours, submit daily updates |

All enforced via PostgreSQL RLS policies at database level.

### Real-time Features (Optional)

Supabase supports real-time updates. To enable:

1. Go to **Replication** in Supabase dashboard
2. Enable for tables you want to watch
3. Use Supabase client's `.on()` method for real-time subscriptions

Example:
```typescript
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
    (payload) => console.log('Task updated:', payload)
  )
  .subscribe()
```

## Troubleshooting

### "Environment variables not found"
- Ensure variables are deployed to Vercel
- Check spelling: must be `NEXT_PUBLIC_` prefix
- Redeploy after adding variables

### "Unauthorized" errors
- Check RLS policies in Supabase
- Verify user has workspace membership
- Check user role permissions for the action

### "Database table doesn't exist"
- Re-run the migration SQL
- Check Supabase SQL Editor history for errors
- Ensure you ran the complete migration file

### Authentication not working
- Verify email provider is enabled in Supabase Auth
- Check browser cookies aren't disabled
- Clear browser cache and try again

### Slow queries
- Check Supabase indexes are created (they are in migration)
- Monitor query performance in Supabase dashboard
- Consider upgrading to paid tier if reaching limits

## File Structure

- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/auth.ts` - Authentication functions
- `lib/supabase/queries.ts` - CRUD operations
- `lib/supabase/middleware.ts` - Route protection
- `hooks/use-supabase.ts` - React hooks for queries
- `supabase/migrations/001_init_schema.sql` - Database schema

## Next Steps

1. **Customize workspace settings** in Settings → Database
2. **Invite team members** in Settings → Team
3. **Create your first project** and start tracking sprints
4. **Enable notifications** for real-time updates
5. **Set up Slack/email integrations** (future phase)

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- View SprintCapacity source: `/lib/supabase/*`
- Check browser console for error details

## Security Notes

- Never commit `.env.local` to version control
- Keep anon key in Vercel only (not in code)
- RLS policies prevent cross-workspace data access
- Passwords are hashed by Supabase Auth
- Consider setting up 2FA for your Supabase account
- Regularly review access logs in Supabase dashboard
