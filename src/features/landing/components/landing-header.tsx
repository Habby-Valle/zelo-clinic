"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const NAV = [
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
  { href: "#contato", label: "Contato" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Zelo
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Entrar
          </Link>
          <a href="#contato" className={buttonVariants({ size: "sm" })}>
            Fale com a gente
          </a>
        </div>
      </div>
    </header>
  );
}
