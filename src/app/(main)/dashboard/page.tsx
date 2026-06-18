export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500">Visão geral da clínica.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Pacientes", "Cuidadores", "Turnos hoje", "SOS ativos"].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-sm text-zinc-400">[ Gráficos e atividade recente — placeholder ]</p>
      </div>
    </div>
  )
}
