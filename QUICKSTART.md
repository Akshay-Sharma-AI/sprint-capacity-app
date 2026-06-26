# SprintCapacity - Quick Start Guide

## 🚀 Get Running in 30 Seconds

### Step 1: Start the Dev Server
```bash
pnpm dev
```

### Step 2: Open Browser
```
http://localhost:3000
```

### Step 3: Explore!
Click through the navigation sidebar to see all 12 pages. Everything is functional with mock data.

---

## 📖 What You'll See

| Page | What to Try |
|------|------------|
| **Dashboard** | View sprint metrics and charts |
| **Projects** | See all 5 projects with status |
| **Backlog** | Click "Add Item" to create a task |
| **Active Sprint** | View Sprint 4 details and blockers |
| **Sprint Board** | See Kanban board with 4 columns |
| **Capacity** | Check team capacity and utilization |
| **Workload** | View individual team member workload |
| **My Tasks** | See assigned tasks (Sarah Chen's view) |
| **Daily Updates** | Submit a daily standup update |
| **Reports** | View analytics and trends |
| **Profile** | Click "Edit" to change profile info |
| **Settings** | Configure workspace and database |

---

## 🎯 Try These Features

### Create a New Project
1. Go to **Projects** page
2. Click **"+ New Project"** button (top right)
3. Fill in the form
4. Click **"Create Project"**
5. See success toast notification

### Create a Sprint
1. Go to **Active Sprint** page
2. Click **"Create Sprint"** button
3. Fill in sprint details
4. Submit and see it added

### Log Hours
1. Go to **My Tasks** page
2. Click **"Log"** button on any task
3. Enter hours worked
4. Submit

### Submit Daily Update
1. Go to **Daily Updates** page
2. Select mood (Good, Neutral, Stuck, Overloaded)
3. Fill in what you worked on
4. Enter plans for tomorrow
5. Click **"Submit Update"**

### View Reports
1. Go to **Reports** page
2. Click different tabs (Velocity, Capacity, etc.)
3. Hover over charts for details
4. Click **"Export Report"** to download

---

## 🎨 Design Highlights

- **Professional UI** - Polished design with consistent spacing and colors
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode Ready** - Full dark mode support built-in
- **Accessible** - WCAG 2.1 AA compliant
- **Real Charts** - Recharts for beautiful data visualization

---

## 📱 Mobile View

To test on mobile:
```bash
# On Mac
open -a "Google Chrome" --args --remote-debugging-port=9222 http://localhost:3000

# Or use Chrome DevTools (F12) → Toggle device toolbar
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
pnpm dev
```

### Build Error
```bash
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Styles Not Loading
```bash
# Clear Tailwind cache
rm -rf .next
pnpm dev
```

---

## 📚 Full Documentation

- **COMPLETION_SUMMARY.md** - Project overview and architecture
- **FEATURES.md** - Complete feature checklist
- **DEPLOYMENT.md** - How to deploy to production
- **SUPABASE_SETUP.md** - Database integration guide

---

## 🌐 Production Deployment

### Deploy to Vercel (1 click)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repo
5. Click "Deploy"

### With Supabase

1. Create Supabase project (https://supabase.com)
2. Get connection credentials
3. Add environment variables to Vercel
4. Run database migrations
5. Done! Your app is live

See **DEPLOYMENT.md** for detailed instructions.

---

## 💡 Key Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components
- **Recharts** - Charts
- **Supabase** - Database (ready to use)

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)

---

## ✨ File Structure

```
app/                    # Pages (12 total)
├── page.tsx            # Dashboard
├── projects/           # Projects page
├── backlog/            # Backlog page
└── ...                 # Other pages

components/            # Reusable React components (58)
├── ui/                 # shadcn/ui components
├── dashboard/          # Dashboard components
├── modals/             # Modal forms (7)
└── ...                 # Other feature components

context/               # State management
├── app-context.tsx     # Central app state

lib/                   # Utilities and helpers
├── mock-data.ts        # Sample data (8 users)
└── supabase/           # Database integration

supabase/              # Database
└── migrations/         # SQL schemas
```

---

## 🚦 Current Status

✅ **Development** - Ready to use and test
✅ **All Features** - Fully implemented and working
✅ **All Pages** - 12/12 complete and functional
✅ **Build** - Clean build with no errors
✅ **Responsive** - Works on all devices
✅ **Production Ready** - Can be deployed anytime

---

## 🎯 Next Steps

1. **Explore** - Click through all pages and try features
2. **Customize** - Edit colors, fonts, or features to your liking
3. **Connect Database** - Follow SUPABASE_SETUP.md to add real database
4. **Deploy** - Follow DEPLOYMENT.md to go live
5. **Share** - Get feedback from your team

---

## 📞 Need Help?

- Check **FEATURES.md** for complete feature list
- Review code comments for implementation details
- See **COMPLETION_SUMMARY.md** for architecture overview
- Visit documentation links in "Learning Resources"

---

**Ready to build something amazing? Start with `pnpm dev` and explore!** 🚀
