import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { CapacityContent } from "@/components/capacity/capacity-content"

export default function CapacityPage() {
  return (
    <AppShell>
      <TopBar title="Capacity Planning" subtitle="Manage team availability and allocation" />
      <CapacityContent />
    </AppShell>
  )
}
