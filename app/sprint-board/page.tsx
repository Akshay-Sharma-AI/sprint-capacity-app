import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { SprintBoardContent } from "@/components/sprint-board/sprint-board-content"

export default function SprintBoardPage() {
  return (
    <AppShell>
      <TopBar title="Sprint Board" subtitle="Kanban view — Sprint 4" />
      <SprintBoardContent />
    </AppShell>
  )
}
