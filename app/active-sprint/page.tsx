import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { ActiveSprintContent } from "@/components/active-sprint/active-sprint-content"

export default function ActiveSprintPage() {
  return (
    <AppShell>
      <TopBar title="Active Sprint" subtitle="Sprint 4 — Platform Redesign" />
      <ActiveSprintContent />
    </AppShell>
  )
}
