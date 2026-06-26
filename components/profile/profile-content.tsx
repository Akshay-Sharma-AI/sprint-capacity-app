"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { users } from "@/lib/mock-data"
import { Check, Mail, Clock, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"

// Current logged-in user (Sarah Chen - u1)
const CURRENT_USER_ID = "u1"
const currentUser = users.find((u) => u.id === CURRENT_USER_ID)!

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    team: currentUser.team,
    dailyCapacityHours: currentUser.dailyCapacityHours.toString(),
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    toast.success("Profile updated successfully")
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      team: currentUser.team,
      dailyCapacityHours: currentUser.dailyCapacityHours.toString(),
    })
    setIsEditing(false)
  }

  const roleColors: Record<string, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/30",
    manager: "bg-primary/10 text-primary border-primary/30",
    member: "bg-muted text-muted-foreground border-border",
  }

  const availabilityColors: Record<string, string> = {
    available: "bg-success/10 text-success border-success/30",
    partial: "bg-warning/10 text-warning-foreground border-warning/30",
    overloaded: "bg-destructive/10 text-destructive border-destructive/30",
    "on-leave": "bg-muted text-muted-foreground border-border",
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Header Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-start gap-6">
              <Avatar className="size-24 border-2 border-primary/30">
                <AvatarFallback className="text-lg font-semibold bg-primary/10">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={roleColors[currentUser.role]}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/30">
                    {currentUser.team} Team
                  </Badge>
                  <Badge variant="outline" className={availabilityColors[currentUser.availabilityStatus]}>
                    {currentUser.availabilityStatus === "on-leave"
                      ? "On Leave"
                      : currentUser.availabilityStatus.charAt(0).toUpperCase() + currentUser.availabilityStatus.slice(1)}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
              >
                {isEditing ? (
                  <>
                    <X className="size-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="size-3" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            {isEditing && (
              <>
                {/* Edit Form */}
                <div className="pt-6 border-t border-border space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@company.com"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={formData.role} placeholder="Your role" disabled />
                      <p className="text-xs text-muted-foreground">Contact admin to change role</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team">Team</Label>
                      <Input id="team" value={formData.team} placeholder="Your team" disabled />
                      <p className="text-xs text-muted-foreground">Contact admin to change team</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Daily Capacity (hours)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.dailyCapacityHours}
                        onChange={(e) => setFormData({ ...formData, dailyCapacityHours: e.target.value })}
                        min="1"
                        max="12"
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin size-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-3" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Additional Info */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                    <p className="text-sm font-mono">{currentUser.id}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={roleColors[currentUser.role]}>
                        {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</p>
                    <p className="text-sm">{currentUser.team}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Capacity</p>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <p className="text-sm">{currentUser.dailyCapacityHours} hours</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Availability</p>
                    <Badge variant="outline" className={availabilityColors[currentUser.availabilityStatus]}>
                      {currentUser.availabilityStatus === "on-leave"
                        ? "On Leave"
                        : currentUser.availabilityStatus.charAt(0).toUpperCase() + currentUser.availabilityStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Your recent actions in SprintCapacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Logged 6 hours on Task", task: "Implement API endpoints", time: "2 hours ago" },
                    { action: "Updated status for", task: "Dashboard Design", time: "4 hours ago" },
                    { action: "Created new task", task: "Sprint Retrospective", time: "1 day ago" },
                    { action: "Marked as done", task: "Database Optimization", time: "2 days ago" },
                    { action: "Added comment on", task: "Performance Issues", time: "3 days ago" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 mt-0.5">
                        <Check className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm">
                          {item.action} <span className="font-medium">{item.task}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates on task assignments</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-medium">Daily Summary</p>
                      <p className="text-xs text-muted-foreground">Get daily digest of sprint updates</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-medium">Comment Notifications</p>
                      <p className="text-xs text-muted-foreground">Get notified when someone comments</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Password change is coming soon")}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
