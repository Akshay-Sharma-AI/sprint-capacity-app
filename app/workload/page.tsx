import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { WorkloadContent } from "@/components/workload/workload-content"

export default function WorkloadPage() {
  return (
    <AppShell>
      <TopBar title="Team Workload" subtitle="Track workload across all team members" />
      <WorkloadContent />
    </AppShell>
  )
}
