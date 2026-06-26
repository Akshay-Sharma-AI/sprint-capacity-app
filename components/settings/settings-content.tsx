"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { User, Building2, Users, Bell, Shield, Trash2, Plus, Mail, Check, Loader2, LogOut } from "lucide-react"
import { useAppContext } from "@/context/app-context"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  manager: "bg-[oklch(0.74_0.16_80/0.1)] text-[oklch(0.5_0.16_80)] border-[oklch(0.74_0.16_80/0.3)]",
  member: "bg-muted text-muted-foreground border-border",
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span className={cn("pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg transform transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="sm:w-64 shrink-0">{children}</div>
    </div>
  )
}

export function SettingsContent() {
  const { users, currentUserId, refresh } = useAppContext()
  const supabase = createClient()
  const router = useRouter()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const currentUser = users.find(u => u.id === currentUserId)
  const [profile, setProfile] = useState({ name: "", email: "" })

  useEffect(() => {
    if (currentUser) {
      setProfile({ name: currentUser.name, email: currentUser.email })
    }
  }, [currentUser])

  const [notifs, setNotifs] = useState({
    taskAssigned: true, blockerAlerts: true, capacityWarnings: true,
    sprintStartEnd: true, mentions: true, dailyDigest: false,
  })

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error("Enter a valid email address")
      return
    }
    setInviting(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Invite sent to ${inviteEmail}! They'll get an email to join.`)
      setInviteEmail("")
      setInviteOpen(false)
      await refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite")
    } finally {
      setInviting(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUserId) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: profile.name })
        .eq('id', currentUserId)
      if (error) throw error
      toast.success("Profile saved!")
      await refresh()
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <Tabs defaultValue="team">
          <TabsList className="h-8 mb-6">
            <TabsTrigger value="team" className="text-xs gap-1.5"><Users className="size-3" />Team</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="size-3" />Profile</TabsTrigger>
            <TabsTrigger value="workspace" className="text-xs gap-1.5"><Building2 className="size-3" />Workspace</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5"><Bell className="size-3" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="size-3" />Security</TabsTrigger>
          </TabsList>

          {/* ── Team tab ── */}
          <TabsContent value="team">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Team Members</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''} in this workspace</p>
                </div>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus data-icon="inline-start" />Invite Member
                </Button>
              </div>

              <Card>
                {users.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No team members yet. Invite someone!</div>
                ) : (
                  <div className="divide-y divide-border">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{user.name}</p>
                            {user.id === currentUserId && (
                              <Badge variant="outline" className="text-xs h-4 px-1.5 text-muted-foreground">You</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-xs capitalize shrink-0", roleColors[user.role] || roleColors.member)}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                <Mail className="size-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Invite your scrum team</p>
                <p className="text-xs text-muted-foreground mt-1">Team members get an email with a link to join — no approval needed.</p>
                <Button size="sm" className="mt-3" onClick={() => setInviteOpen(true)}>
                  <Plus data-icon="inline-start" />Send Invite
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Profile tab ── */}
          <TabsContent value="profile">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Your Profile</CardTitle>
                  <CardDescription className="text-xs">Update your display name shown to the team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        {currentUser?.initials || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{currentUser?.name || 'Not signed in'}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                      <Badge variant="outline" className={cn("text-xs mt-1 capitalize", roleColors[currentUser?.role || 'member'])}>
                        {currentUser?.role || 'member'}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="h-8 text-sm max-w-sm"
                      placeholder="Your display name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={profile.email} disabled className="h-8 text-sm max-w-sm opacity-60" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveProfile} size="sm" disabled={savingProfile || !currentUserId}>
                      {savingProfile ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Check className="size-3.5 mr-1.5" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="size-3.5 mr-1.5" />Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Workspace tab ── */}
          <TabsContent value="workspace">
            <div className="max-w-2xl">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
                  <CardDescription className="text-xs">Sprint defaults and workflow preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingRow label="Default Sprint Duration" description="Length of sprints in working days">
                    <Select defaultValue="10">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="text-xs">1 week (5 days)</SelectItem>
                        <SelectItem value="10" className="text-xs">2 weeks (10 days)</SelectItem>
                        <SelectItem value="15" className="text-xs">3 weeks (15 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Daily Working Hours" description="Default capacity per team member per day">
                    <Input type="number" defaultValue="8" min="1" max="12" className="h-8 text-sm" />
                  </SettingRow>
                  <SettingRow label="Capacity Warning Threshold" description="Alert when utilization exceeds this %">
                    <Input type="number" defaultValue="85" min="50" max="100" className="h-8 text-sm" />
                  </SettingRow>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success("Saved!")} size="sm">
                      <Check data-icon="inline-start" className="size-3.5" />Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Notifications tab ── */}
          <TabsContent value="notifications">
            <div className="max-w-2xl">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
                  <CardDescription className="text-xs">Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent>
                  {([
                    { key: "taskAssigned", label: "Task Assigned", description: "When a task is assigned to you" },
                    { key: "blockerAlerts", label: "Blocker Alerts", description: "When a task you own is blocked" },
                    { key: "capacityWarnings", label: "Capacity Warnings", description: "When utilization exceeds threshold" },
                    { key: "sprintStartEnd", label: "Sprint Start / End", description: "When sprints begin and close" },
                    { key: "mentions", label: "Mentions", description: "When someone mentions you" },
                    { key: "dailyDigest", label: "Daily Digest", description: "Morning summary of your tasks" },
                  ] as const).map(({ key, label, description }) => (
                    <SettingRow key={key} label={label} description={description}>
                      <div className="flex justify-end">
                        <Toggle checked={notifs[key]} onChange={v => setNotifs({ ...notifs, [key]: v })} />
                      </div>
                    </SettingRow>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success("Saved!")} size="sm">
                      <Check data-icon="inline-start" className="size-3.5" />Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Security tab ── */}
          <TabsContent value="security">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirm Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-8 text-sm" />
                    </div>
                  </div>
                  <Button onClick={() => toast.success("Password updated!")} size="sm">Update Password</Button>
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
                      <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and data.</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="size-3.5" data-icon="inline-start" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              They'll receive an email with a link to join the team. No approval needed — they're in instantly.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleInvite} disabled={inviting}>
              {inviting ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Mail className="size-3.5 mr-1.5" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => toast.error("Contact admin to delete account.")}>
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  )
}
