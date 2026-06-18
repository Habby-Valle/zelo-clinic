"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  ClipboardList,
  AlertTriangle,
  BarChart2,
  Settings,
  ScrollText,
  MessageSquare,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: UserCircle },
  { href: "/users", label: "Usuários", icon: Users },
  { href: "/shifts", label: "Turnos", icon: Calendar },
  { href: "/checklists", label: "Checklists", icon: ClipboardList },
  { href: "/sos", label: "SOS", icon: AlertTriangle },
  { href: "/reports", label: "Relatórios", icon: BarChart2 },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/plan", label: "Plano", icon: CreditCard },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Zelo Clinic</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
