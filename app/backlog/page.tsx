import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { BacklogContent } from "@/components/backlog/backlog-content"

export default function BacklogPage() {
  return (
    <AppShell>
      <TopBar title="Backlog" subtitle="Manage and prioritize your product backlog" />
      <BacklogContent />
    </AppShell>
  )
}
