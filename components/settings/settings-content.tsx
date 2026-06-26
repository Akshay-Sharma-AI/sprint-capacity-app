"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  User,
  Building2,
  Users,
  Bell,
  Shield,
  Trash2,
  Plus,
  Mail,
  Check,
  MoreHorizontal,
  Database,
} from "lucide-react"
import { users } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SupabaseSetup } from "@/components/settings/supabase-setup"

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  manager: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]",
  member: "bg-muted text-muted-foreground border-border",
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="sm:w-64 shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg transform transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function SettingsContent() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")

  // Notification toggles
  const [notifs, setNotifs] = useState({
    sprintStartEnd: true,
    taskAssigned: true,
    dailyDigest: false,
    blockerAlerts: true,
    capacityWarnings: true,
    mentions: true,
  })

  // Profile state
  const [profile, setProfile] = useState({
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Sprint Manager",
    timezone: "America/Los_Angeles",
    dailyCapacity: "8",
  })

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Tabs defaultValue="profile">
          <TabsList className="h-8 mb-6">
            <TabsTrigger value="profile" className="text-xs gap-1.5">
              <User className="size-3" />Profile
            </TabsTrigger>
            <TabsTrigger value="workspace" className="text-xs gap-1.5">
              <Building2 className="size-3" />Workspace
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs gap-1.5">
              <Users className="size-3" />Team
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5">
              <Bell className="size-3" />Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5">
              <Shield className="size-3" />Security
            </TabsTrigger>
            <TabsTrigger value="database" className="text-xs gap-1.5">
              <Database className="size-3" />Database
            </TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Your Profile</CardTitle>
                  <CardDescription className="text-xs">Update your personal information and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">SC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5">
                      <Button variant="outline" size="sm" onClick={() => toast.info("Upload photo...")}>
                        Change Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG, or GIF. Max 2MB.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Job Title</Label>
                      <Input
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Timezone</Label>
                      <Select value={profile.timezone} onValueChange={(v) => setProfile({ ...profile, timezone: v })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles" className="text-xs">Pacific (UTC-8)</SelectItem>
                          <SelectItem value="America/New_York" className="text-xs">Eastern (UTC-5)</SelectItem>
                          <SelectItem value="Europe/London" className="text-xs">London (UTC+0)</SelectItem>
                          <SelectItem value="Asia/Tokyo" className="text-xs">Tokyo (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Daily Capacity (hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={profile.dailyCapacity}
                        onChange={(e) => setProfile({ ...profile, dailyCapacity: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => toast.success("Profile saved!")} size="sm">
                      <Check data-icon="inline-start" className="size-3.5" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workspace tab */}
          <TabsContent value="workspace">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
                  <CardDescription className="text-xs">Configure sprint defaults and workflow preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingRow label="Workspace Name" description="The name of your organization workspace">
                    <Input defaultValue="Acme Engineering" className="h-8 text-sm" />
                  </SettingRow>
                  <SettingRow label="Default Sprint Duration" description="Length of sprints in working days">
                    <Select defaultValue="10">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="text-xs">1 week (5 days)</SelectItem>
                        <SelectItem value="10" className="text-xs">2 weeks (10 days)</SelectItem>
                        <SelectItem value="15" className="text-xs">3 weeks (15 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Story Point Scale" description="Fibonacci or T-shirt sizing">
                    <Select defaultValue="fibonacci">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fibonacci" className="text-xs">Fibonacci (1, 2, 3, 5, 8…)</SelectItem>
                        <SelectItem value="tshirt" className="text-xs">T-shirt (XS, S, M, L, XL)</SelectItem>
                        <SelectItem value="linear" className="text-xs">Linear (1–10)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Default Working Hours" description="Standard working hours per day">
                    <Input type="number" defaultValue="8" min="1" max="12" className="h-8 text-sm" />
                  </SettingRow>
                  <SettingRow label="Capacity Warning Threshold" description="Alert when utilization exceeds this %">
                    <Input type="number" defaultValue="85" min="50" max="100" className="h-8 text-sm" />
                  </SettingRow>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success("Workspace settings saved!")} size="sm">
                      <Check data-icon="inline-start" className="size-3.5" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team tab */}
          <TabsContent value="team">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Team Members</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{users.length} members in this workspace</p>
                </div>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Invite Member
                </Button>
              </div>

              <Card>
                <div className="divide-y divide-border">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          {user.id === "u1" && (
                            <Badge variant="outline" className="text-xs h-4 px-1.5 text-muted-foreground">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-xs capitalize", roleColors[user.role])}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">{user.team}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 text-muted-foreground"
                          onClick={() => toast.info(`Manage ${user.name}`)}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Invite dialog */}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Address</Label>
                    <div className="flex gap-2">
                      <Mail className="size-4 text-muted-foreground mt-2 shrink-0" />
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                        <SelectItem value="manager" className="text-xs">Manager</SelectItem>
                        <SelectItem value="member" className="text-xs">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!inviteEmail) { toast.error("Please enter an email address."); return }
                      toast.success(`Invitation sent to ${inviteEmail}`)
                      setInviteEmail("")
                      setInviteOpen(false)
                    }}
                  >
                    Send Invite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications">
            <div className="max-w-2xl">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent>
                  {(
                    [
                      { key: "taskAssigned", label: "Task Assigned", description: "When a task is assigned to you" },
                      { key: "blockerAlerts", label: "Blocker Alerts", description: "When a task you own is blocked" },
                      { key: "capacityWarnings", label: "Capacity Warnings", description: "When your utilization exceeds the threshold" },
                      { key: "sprintStartEnd", label: "Sprint Start / End", description: "Reminders when sprints begin and close" },
                      { key: "mentions", label: "Mentions", description: "When someone mentions you in a comment" },
                      { key: "dailyDigest", label: "Daily Digest", description: "Morning summary of your tasks and sprint status" },
                    ] as const
                  ).map(({ key, label, description }) => (
                    <SettingRow key={key} label={label} description={description}>
                      <div className="flex justify-end">
                        <Toggle
                          checked={notifs[key]}
                          onChange={(v) => setNotifs({ ...notifs, [key]: v })}
                        />
                      </div>
                    </SettingRow>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success("Notification preferences saved!")} size="sm">
                      <Check data-icon="inline-start" className="size-3.5" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security tab */}
          <TabsContent value="security">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Current Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-8 text-sm" />
                    </div>
                    <div />
                    <div className="space-y-1.5">
                      <Label className="text-xs">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirm New Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => toast.success("Password updated!")} size="sm">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-xs">Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Use an app like Authy or Google Authenticator</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("2FA setup flow...")}>
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Delete Account</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all associated data.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-3.5" data-icon="inline-start" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account and all associated data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => toast.error("Account deletion requested.")}
                  >
                    Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* Database tab */}
          <TabsContent value="database">
            <div className="max-w-4xl">
              <SupabaseSetup />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
