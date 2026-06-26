import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <AppShell>
      <TopBar title="Settings" subtitle="Manage your workspace, team, and notification preferences" />
      <SettingsContent />
    </AppShell>
  )
}
