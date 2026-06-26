# SprintCapacity - Deployment Guide

## Quick Start (Development)

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

The app will be available at http://localhost:3000 with all features functional using mock data.

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

#### Prerequisites
- Vercel account (free or paid)
- GitHub repository

#### Steps
1. **Connect Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **Configure Environment Variables**
   - After deployment, go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
     ```
   - Redeploy after adding variables

#### Domain Configuration
- Your app will be live at: `yourapp.vercel.app`
- To use custom domain:
  1. Go to Project Settings → Domains
  2. Add your custom domain
  3. Update DNS records per Vercel instructions

### Option 2: Deploy to Other Platforms

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

#### AWS / Azure / Google Cloud
- Use standard Next.js deployment documentation
- Environment variables must be set in platform settings
- Use `pnpm build && pnpm start` for production

## Supabase Integration

### Setup Supabase (Required for Production)

#### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Sign up or login
# Click "New Project"
# Fill in project details
# Wait for project to initialize
```

#### 2. Get Connection Credentials
- Go to Project Settings → API
- Copy:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. Run Database Migrations
```bash
# Option A: Using Supabase CLI
supabase start
supabase db push

# Option B: Manual SQL
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Click "New Query"
# 3. Paste contents of: supabase/migrations/001_init_schema.sql
# 4. Click "Run"
```

#### 4. Enable Authentication
- Go to Authentication → Providers
- Enable Email Provider
- Configure email templates (optional)

#### 5. Set Environment Variables
```bash
# In your deployment platform:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
```

### Database Schema
The SQL migration includes:
- `workspaces` - Workspace/tenant management
- `users` - User accounts and profiles
- `projects` - Project management
- `sprints` - Sprint planning
- `tasks` - Task management
- `task_assignments` - Task assignments
- `capacities` - Capacity planning
- `daily_updates` - Daily standup records

### Row-Level Security (RLS)
All tables have RLS policies enforcing:
- Multi-tenant isolation (workspace-based)
- Role-based access (Admin, Manager, Member)
- User data privacy

## Performance Optimization

### Recommended Vercel Settings
1. **Project Settings → Build & Development**
   - Build Command: `pnpm build`
   - Output Directory: `.next`

2. **Edge Functions (Optional)**
   - Middleware is already configured
   - Deploy to Edge for faster auth checks

3. **Analytics**
   - Enable Web Analytics for performance insights
   - Monitor Core Web Vitals

### CDN Configuration
- All static assets cached globally
- Images optimized with Next.js Image component
- CSS and JS minified

## Environment Variables

### Required
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key
```

### Optional (for future features)
```
SLACK_WEBHOOK_URL               # For Slack notifications
GITHUB_TOKEN                    # For GitHub integration
STRIPE_API_KEY                  # For payments (future)
```

## Monitoring & Maintenance

### Health Checks
- Vercel includes automatic health monitoring
- Check deployment status at vercel.com/dashboard

### Error Tracking
- Error logs accessible in Vercel dashboard
- Configure error reporting service for production

### Database Backups
- Supabase provides automatic daily backups
- Enable Point-in-Time Recovery if needed

### Performance Metrics
- Use Vercel Analytics for performance tracking
- Monitor Supabase query performance

## Troubleshooting

### Build Failures
**Error: `Can't find variable: process`**
- Ensure all environment variables are set correctly
- Check NEXT_PUBLIC_* prefix for public variables

**Error: `Module not found: tsconfig.json`**
- Run `pnpm install` again
- Clear `.next` directory: `rm -rf .next`

### Runtime Issues
**Blank screen on login**
- Check Supabase connection credentials
- Verify CORS settings in Supabase
- Check browser console for errors

**Auth not working**
- Verify Supabase Auth Provider is enabled
- Check redirect URLs in Supabase
- Ensure middleware.ts is deployed

### Database Issues
**Connection refused**
- Check Supabase project status
- Verify network permissions
- Check IP whitelist settings

## Scaling Considerations

### For 100+ Users
- Enable Supabase connection pooling
- Upgrade to Pro plan for better performance
- Implement caching with Redis (optional)

### For 1000+ Users
- Use Supabase Vector for search
- Implement queue system (Bull, RabbitMQ)
- Consider CDN upgrade
- Enable Full-Text Search on relevant tables

## Backup & Disaster Recovery

### Database Backup
```bash
# Weekly export
supabase db pull

# Before major releases
supabase db dump --data-only > backup.sql
```

### Code Backup
- Always use version control (Git)
- Tag releases for easy rollback

## Post-Deployment

### Day 1
- ✅ Verify all pages load
- ✅ Test authentication flow
- ✅ Check database connectivity
- ✅ Verify email notifications
- ✅ Monitor error logs

### Week 1
- ✅ Get user feedback
- ✅ Monitor performance metrics
- ✅ Fix reported issues
- ✅ Optimize slow queries

### Month 1
- ✅ Analyze usage patterns
- ✅ Plan feature updates
- ✅ Optimize database indexes
- ✅ Plan security audit

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Report bugs on your repo

## License

This project is ready for commercialization. Add appropriate license file:
- MIT License (for open source)
- Commercial License (for closed source)
- Dual Licensed (option for both)

---

**Ready to Deploy?** Follow the steps above and your SprintCapacity app will be live in minutes!

For questions or issues, check the documentation or community forums for the respective platforms.
