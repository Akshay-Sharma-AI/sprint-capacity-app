import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { ProjectsContent } from "@/components/projects/projects-content"

export default function ProjectsPage() {
  return (
    <AppShell>
      <TopBar title="Projects" subtitle="Manage your active and planned projects" />
      <ProjectsContent />
    </AppShell>
  )
}
