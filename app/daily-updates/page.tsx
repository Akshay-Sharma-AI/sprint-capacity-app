import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { DailyUpdatesContent } from "@/components/daily-updates/daily-updates-content"

export default function DailyUpdatesPage() {
  return (
    <AppShell>
      <TopBar title="Daily Updates" subtitle="Log your daily standup — what you worked on, what's next, and any blockers" />
      <DailyUpdatesContent />
    </AppShell>
  )
}
