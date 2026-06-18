import { requireClinicAdmin } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await requireClinicAdmin()

  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
