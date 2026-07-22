import Link from "next/link";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-lg font-bold tracking-tight">Zelo</p>
          <p className="text-sm text-muted-foreground">Plataforma de gestão de cuidados</p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#recursos" className="hover:text-foreground">
            Recursos
          </a>
          <a href="#planos" className="hover:text-foreground">
            Planos
          </a>
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; {year} Zelo. Todos os direitos reservados.
      </div>
    </footer>
  );
}
