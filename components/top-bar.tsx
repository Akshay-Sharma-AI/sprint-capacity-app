"use client"

import { Bell, Search, ChevronDown, Settings, LogOut, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks, sprints..."
            className="pl-8 h-8 w-56 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Actions */}
        {actions}

        {/* Notifications */}
        <button
          type="button"
          className="relative flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => toast.info("3 new notifications")}
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 h-8 px-2 rounded-md text-sm font-medium hover:bg-accent transition-colors">
            <div className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
              SC
            </div>
            <span className="hidden sm:block text-sm font-medium">Sarah Chen</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => toast.info("Profile page coming soon")}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Settings page")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Logged out")}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
