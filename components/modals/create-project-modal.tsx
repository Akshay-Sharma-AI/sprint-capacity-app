"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { createProject, users } = useApp()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [ownerId, setOwnerId] = useState(users[0]?.id || "")

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }

    createProject({
      name: name.trim(),
      owner: users.find((u) => u.id === ownerId)?.name || "Unknown",
      ownerId,
      status: "planning",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currentSprint: "",
      teamSize: 0,
      completionPercentage: 0,
      description: description.trim(),
    })

    toast.success("Project created successfully")
    onOpenChange(false)
    setName("")
    setDescription("")
    setOwnerId(users[0]?.id || "")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g., Platform Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project description and goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="owner">Project Owner</Label>
            <select
              id="owner"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
