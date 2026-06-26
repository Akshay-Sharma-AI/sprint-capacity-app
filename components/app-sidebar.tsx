"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

interface UserProfile {
  full_name: string | null
  email: string | null
  role: string | null
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "??"
}

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }
        const { data } = await supabase
          .from("users")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single()
        if (data) {
          setProfile(data)
        } else {
          setProfile({ full_name: null, email: user.email ?? null, role: null })
        }
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const displayName = profile?.full_name || profile?.email || null
  const initials = getInitials(profile?.full_name ?? null, profile?.email ?? null)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-2 px-4 py-4 border-b border-sidebar-border", collapsed && "justify-center px-0")}>
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary shrink-0">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">
              SprintCapacity
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
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
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              }

              return <li key={item.href}>{link}</li>
            })}
          </ul>
        </nav>

        {/* User + collapse */}
        <div className="border-t border-sidebar-border">
          {!loading && (
            <>
              {profile ? (
                !collapsed && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-sidebar-foreground truncate">
                        {displayName}
                      </p>
                      {profile.role && (
                        <p className="text-xs text-sidebar-foreground/50 truncate capitalize">
                          {profile.role}
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                !collapsed && (
                  <div className="px-4 py-3">
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                    >
                      <LogIn className="size-3.5 shrink-0" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )
              )}
            </>
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
