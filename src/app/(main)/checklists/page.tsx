export default function ChecklistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Checklists</h1>
          <p className="text-sm text-zinc-500">Protocolos de cuidado e tarefas.</p>
        </div>
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
          Novo checklist
        </button>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-sm text-zinc-400">[ Tabela de checklists — placeholder ]</p>
      </div>
    </div>
  )
}
