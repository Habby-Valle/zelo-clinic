export const metadata = { title: "Usuário — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuário</h1>
        <p className="mt-1 text-sm text-muted-foreground">ID: {id}</p>
      </div>
      <div className="rounded-lg border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          [ Detalhes do usuário — placeholder ]
        </p>
      </div>
    </div>
  );
}
