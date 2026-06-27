"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/context/app-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Edit2, Save, X, LogOut, Loader2, Clock, ShieldCheck, Mail, User,
  KeyRound, CheckCircle2, AlertCircle,
} from "lucide-react"

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/30",
  manager: "bg-primary/10 text-primary border-primary/30",
  member: "bg-muted text-muted-foreground border-border",
}

const statusColors: Record<string, string> = {
  available: "bg-green-500/10 text-green-700 border-green-500/30",
  partial: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  overloaded: "bg-red-500/10 text-red-700 border-red-500/30",
  "on-leave": "bg-muted text-muted-foreground border-border",
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

export function ProfileContent() {
  const { users, currentUserId, refresh } = useAppContext()
  const supabase = createClient()
  const router = useRouter()

  const currentUser = users.find(u => u.id === currentUserId)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")

  const [passwords, setPasswords] = useState({ new: "", confirm: "" })
  const [changingPw, setChangingPw] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  useEffect(() => {
    if (currentUser) setName(currentUser.name)
  }, [currentUser])

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??'

  const handleSaveName = async () => {
    if (!currentUserId || !name.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('users').update({ full_name: name.trim() }).eq('id', currentUserId)
      if (error) throw error
      await refresh()
      toast.success("Name updated successfully")
      setIsEditing(false)
    } catch {
      toast.error("Failed to update name")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new.length < 6) { toast.error("Password must be at least 6 characters"); return }
    if (passwords.new !== passwords.confirm) { toast.error("Passwords don't match"); return }
    setChangingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new })
      if (error) throw error
      toast.success("Password updated!")
      setPasswords({ new: "", confirm: "" })
      setShowPwForm(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to update password")
    } finally {
      setChangingPw(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!currentUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
        <User className="size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">You're not signed in</p>
        <Button size="sm" onClick={() => router.push('/login')}>Sign in to view profile</Button>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-3xl space-y-6">

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <Avatar className="size-16 border-2 border-primary/20 shrink-0">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="h-8 text-sm max-w-[240px] font-semibold"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setIsEditing(false); setName(currentUser?.name || "") } }}
                    />
                    <Button size="sm" className="h-8" onClick={handleSaveName} disabled={saving}>
                      {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => { setIsEditing(false); setName(currentUser?.name || "") }}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{currentUser?.name || 'Unknown'}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {currentUser?.email || '—'}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs capitalize ${roleColors[currentUser?.role || 'member']}`}>
                    {currentUser?.role || 'member'}
                  </Badge>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[currentUser?.availabilityStatus || 'available']}`}>
                    {currentUser?.availabilityStatus === 'on-leave' ? 'On Leave' : (currentUser?.availabilityStatus || 'available')}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleSignOut} className="shrink-0">
                <LogOut className="size-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList className="h-8">
            <TabsTrigger value="details" className="text-xs gap-1.5">
              <User className="size-3" />Details
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5">
              <ShieldCheck className="size-3" />Security
            </TabsTrigger>
          </TabsList>

          {/* Details tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Account Details</CardTitle>
                <CardDescription className="text-xs">Your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-5">
                  <InfoRow label="Full Name" value={currentUser?.name || '—'} />
                  <InfoRow label="Email" value={currentUser?.email || '—'} />
                  <InfoRow label="Role" value={currentUser?.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Member'} />
                  <InfoRow label="Availability" value={currentUser?.availabilityStatus === 'on-leave' ? 'On Leave' : (currentUser?.availabilityStatus ? (currentUser.availabilityStatus.charAt(0).toUpperCase() + currentUser.availabilityStatus.slice(1)) : 'Available')} />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Capacity</p>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {currentUser?.dailyCapacityHours ?? 8} hours
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">{currentUserId}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground flex-1">
                    To change your display name, click the edit icon next to your name above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Password</CardTitle>
                  <CardDescription className="text-xs">Keep your account secure with a strong password</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showPwForm ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <KeyRound className="size-4" />
                        Password last changed: unknown
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setShowPwForm(true)}>
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">New Password</Label>
                          <Input
                            type="password"
                            placeholder="Min 6 characters"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              type="password"
                              placeholder="Same as above"
                              value={passwords.confirm}
                              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                              className={`h-8 text-sm pr-8 ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-destructive' : ''}`}
                            />
                            {passwords.confirm && (
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                {passwords.new === passwords.confirm
                                  ? <CheckCircle2 className="size-3.5 text-green-600" />
                                  : <AlertCircle className="size-3.5 text-destructive" />
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={changingPw}>
                          {changingPw ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
                          Update Password
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => { setShowPwForm(false); setPasswords({ new: "", confirm: "" }) }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Sign out of this account</p>
                      <p className="text-xs text-muted-foreground mt-0.5">You'll be redirected to the login page</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="size-3.5 mr-1.5" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
