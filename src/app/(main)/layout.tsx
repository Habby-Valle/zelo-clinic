import { requireClinicUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireClinicUser();

  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar role={user.role} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={user.role} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
