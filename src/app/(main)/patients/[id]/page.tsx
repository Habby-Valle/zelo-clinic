interface Props {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Paciente</h1>
        <p className="text-sm text-zinc-500">ID: {id}</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-sm text-zinc-400">[ Detalhes do paciente — placeholder ]</p>
      </div>
    </div>
  )
}
