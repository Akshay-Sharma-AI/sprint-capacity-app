"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Zap,
  SquareKanban,
  Settings,
  CheckSquare,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LogIn,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/backlog", label: "Backlog", icon: ListTodo },
  { href: "/active-sprint", label: "Active Sprint", icon: Zap },
  { href: "/sprint-board", label: "Sprint Board", icon: SquareKanban },
  { href: "/capacity", label: "Capacity", icon: Gauge },
  { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/daily-updates", label: "Daily Updates", icon: MessageSquare },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

interface UserProfile {
  full_name: string | null
  email: string | null
  role: string | null
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "??"
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setProfile(null); setLoading(false); return }
        const { data } = await supabase.from("users").select("full_name, email, role").eq("id", user.id).single()
        setProfile(data ?? { full_name: null, email: user.email ?? null, role: null })
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const displayName = profile?.full_name || profile?.email || null
  const initials = getInitials(profile?.full_name ?? null, profile?.email ?? null)

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    const link = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
          collapsed && "justify-center px-0 size-10 mx-auto"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return link
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-60"
      )}>
        {/* Logo */}
        <div className={cn("flex items-center gap-2 px-4 py-4 border-b border-sidebar-border", collapsed && "justify-center px-0")}>
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary shrink-0">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">SprintCapacity</span>}
        </div>

        {/* Main nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map(item => (
              <li key={item.href}><NavLink item={item} /></li>
            ))}
          </ul>

          {/* Divider + bottom items */}
          <div className="mt-3 pt-3 border-t border-sidebar-border/50 px-2 space-y-0.5">
            {bottomItems.map(item => (
              <li key={item.href} className="list-none"><NavLink item={item} /></li>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border">
          {!loading && (
            profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 hover:bg-sidebar-accent/60 transition-colors",
                    collapsed && "justify-center px-0"
                  )}>
                    <div className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                    {!collapsed && (
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
                        {profile.role && (
                          <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{profile.role}</p>
                        )}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={collapsed ? "right" : "top"} align="start" className="w-48 mb-1">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="size-3.5" />Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="size-3.5" />Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="size-3.5 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-t border-primary/20",
                  collapsed && "justify-center px-0"
                )}
              >
                <LogIn className="size-4 shrink-0" />
                {!collapsed && <span>Sign in to create & edit</span>}
              </Link>
            )
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center justify-center w-full py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
              collapsed && "py-3"
            )}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
