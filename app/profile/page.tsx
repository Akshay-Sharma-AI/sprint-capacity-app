import { AppShell } from "@/components/app-shell"
import { TopBar } from "@/components/top-bar"
import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <AppShell>
      <TopBar
        title="Profile"
        subtitle="Manage your personal information and preferences"
      />
      <ProfileContent />
    </AppShell>
  )
}
