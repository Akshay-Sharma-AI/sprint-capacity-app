import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { ReportsContent } from "@/components/reports/reports-content"

export default function ReportsPage() {
  return (
    <AppShell>
      <TopBar title="Reports" subtitle="Sprint velocity, capacity trends, and team performance analytics" />
      <ReportsContent />
    </AppShell>
  )
}
