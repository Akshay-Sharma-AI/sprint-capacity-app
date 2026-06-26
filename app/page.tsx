import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  return (
    <AppShell>
      <TopBar
        title="Dashboard"
        subtitle="Welcome back, Sarah — here's your sprint overview"
      />
      <DashboardContent />
    </AppShell>
  )
}
