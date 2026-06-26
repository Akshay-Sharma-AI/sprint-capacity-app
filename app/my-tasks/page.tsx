import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { MyTasksContent } from "@/components/my-tasks/my-tasks-content"

export default function MyTasksPage() {
  return (
    <AppShell>
      <TopBar title="My Tasks" subtitle="Your assigned tasks across all sprints and projects" />
      <MyTasksContent />
    </AppShell>
  )
}
