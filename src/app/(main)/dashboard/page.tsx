import Link from "next/link";
import {
  Users,
  UserCog,
  CalendarClock,
  AlertTriangle,
  ClipboardCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { requireClinicAdmin } from "@/lib/auth";
import { fetchDashboard, fetchRecentShifts } from "@/features/dashboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard — Zelo Clinic" };

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  scheduled: "Agendado",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
  scheduled: "outline",
};

// ─── components ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  highlight?: "blue" | "red" | "green" | "default";
}

function KpiCard({ label, value, sub, icon: Icon, highlight = "default" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            highlight === "blue" && "bg-blue-50 dark:bg-blue-950",
            highlight === "red" && "bg-red-50 dark:bg-red-950",
            highlight === "green" && "bg-emerald-50 dark:bg-emerald-950",
            highlight === "default" && "bg-zinc-100 dark:bg-zinc-800"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              highlight === "blue" && "text-blue-600 dark:text-blue-400",
              highlight === "red" && "text-red-600 dark:text-red-400",
              highlight === "green" && "text-emerald-600 dark:text-emerald-400",
              highlight === "default" && "text-zinc-500 dark:text-zinc-400"
            )}
          />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

function QuickActionLink({
  href,
  icon: Icon,
  label,
  description,
  variant = "default",
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  variant?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        variant === "default" &&
          "border-zinc-200 hover:border-blue-200 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/40",
        variant === "danger" &&
          "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          variant === "default" && "bg-zinc-100 dark:bg-zinc-800",
          variant === "danger" && "bg-red-100 dark:bg-red-900/60"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            variant === "default" && "text-zinc-600 dark:text-zinc-400",
            variant === "danger" && "text-red-600 dark:text-red-400"
          )}
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            variant === "default" && "text-zinc-900 dark:text-zinc-50",
            variant === "danger" && "text-red-700 dark:text-red-400"
          )}
        >
          {label}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-zinc-400" />
    </Link>
  );
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { user } = await requireClinicAdmin();

  const [dashboard, recentShifts] = await Promise.all([
    fetchDashboard().catch(() => null),
    fetchRecentShifts(),
  ]);

  const kpis = dashboard?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bem-vindo,{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">Sistema operacional</span>
        </div>
      </div>

      {/* KPI cards — 3 linhas de 3 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis ? (
          <>
            <KpiCard
              label="Pacientes"
              value={kpis.totalPatients}
              sub={`+${kpis.newPatientsThisMonth} este mês`}
              icon={Users}
              highlight="blue"
            />
            <KpiCard
              label="Clientes"
              value={kpis.totalFamilyMembers}
              sub="familiares cadastrados"
              icon={Users}
              highlight="blue"
            />
            <KpiCard
              label="Cuidadores"
              value={kpis.totalCaregivers}
              sub="ativos na clínica"
              icon={UserCog}
              highlight="blue"
            />
            <KpiCard
              label="Turnos Hoje"
              value={kpis.shiftsToday}
              sub={`${kpis.completedToday} concluídos`}
              icon={CalendarClock}
              highlight={kpis.shiftsToday > 0 ? "green" : "default"}
            />
            <KpiCard
              label="Pendentes Hoje"
              value={kpis.pendingToday}
              sub="ainda em aberto"
              icon={TrendingUp}
              highlight={kpis.pendingToday > 0 ? "blue" : "default"}
            />
            <KpiCard
              label="Checklists Hoje"
              value={kpis.checklistsToday}
              sub="concluídos"
              icon={ClipboardCheck}
              highlight={kpis.checklistsToday > 0 ? "green" : "default"}
            />
            <KpiCard
              label="Em Andamento"
              value={kpis.activeShifts}
              sub="turnos agora"
              icon={Clock}
              highlight={kpis.activeShifts > 0 ? "blue" : "default"}
            />
            <KpiCard
              label="SOS Ativos"
              value={kpis.activeSosAlerts}
              sub={
                kpis.acknowledgedSosAlerts > 0
                  ? `${kpis.acknowledgedSosAlerts} reconhecidos`
                  : "nenhum pendente"
              }
              icon={AlertTriangle}
              highlight={kpis.activeSosAlerts > 0 ? "red" : "default"}
            />
            <KpiCard
              label="Satisfação"
              value={kpis.avgSatisfaction != null ? `${kpis.avgSatisfaction.toFixed(1)}★` : "—"}
              sub={
                kpis.totalRatings > 0
                  ? `NPS ${kpis.nps} · ${kpis.totalRatings} avaliação${kpis.totalRatings > 1 ? "ões" : ""}`
                  : "sem avaliações"
              }
              icon={Star}
              highlight={kpis.avgSatisfaction != null ? "green" : "default"}
            />
          </>
        ) : (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-12" />
              <Skeleton className="mt-1 h-3 w-32" />
            </div>
          ))
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Turnos recentes — 3/5 */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Turnos Recentes
              </h2>
              <Link
                href="/shifts"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentShifts.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-400">
                  Nenhum turno registrado ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Cuidador</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentShifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                          {shift.patients[0]?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400">
                          {shift.caregiver?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-zinc-500 dark:text-zinc-400">
                          {fmtDate(shift.started_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[shift.status] ?? "outline"}>
                            {STATUS_LABEL[shift.status] ?? shift.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        {/* Ações rápidas — 2/5 */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Ações Rápidas
              </h2>
            </div>
            <div className="space-y-2 p-4">
              <QuickActionLink
                href="/patients/new"
                icon={Users}
                label="Novo Paciente"
                description="Cadastrar paciente na clínica"
              />
              <QuickActionLink
                href="/users"
                icon={UserCog}
                label="Gerenciar Usuários"
                description="Cuidadores, familiares e guardiões"
              />
              <QuickActionLink
                href="/shifts"
                icon={CalendarClock}
                label="Turnos"
                description="Visualizar e gerenciar turnos"
              />
              <QuickActionLink
                href="/checklists"
                icon={ClipboardCheck}
                label="Checklists"
                description="Protocolos de cuidado"
              />
              {kpis && kpis.activeSosAlerts > 0 && (
                <QuickActionLink
                  href="/sos"
                  icon={AlertTriangle}
                  label={`${kpis.activeSosAlerts} SOS Ativo${kpis.activeSosAlerts > 1 ? "s" : ""}`}
                  description="Verificar emergência imediatamente"
                  variant="danger"
                />
              )}
              {kpis && kpis.activeSosAlerts === 0 && (
                <QuickActionLink
                  href="/sos"
                  icon={CheckCircle2}
                  label="SOS"
                  description="Nenhum alerta ativo"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
