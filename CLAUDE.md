# CLAUDE.md — Zelo Clinic (Clinic Admin)

Você é um engenheiro sênior especialista em Next.js, TypeScript, TanStack Query e integração com APIs REST (Django). Priorize código limpo, seguro e escalável.

---

## Visão Geral

O **Zelo** é uma plataforma de gestão de cuidados com pacientes (principalmente idosos). Este projeto é o **Painel Clinic Admin** — acesso restrito a uma clínica específica.

---

## Tech Stack (obrigatório seguir)

| Camada      | Tecnologia                                             |
| ----------- | ------------------------------------------------------ |
| Framework   | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Estilo      | Tailwind CSS v4 + shadcn/ui + lucide-react             |
| Backend     | API REST Django                                        |
| Estado      | Zustand + TanStack Query                               |
| Formulários | React Hook Form + Zod                                  |
| Deploy      | Vercel                                                 |
| Lint        | ESLint + Prettier                                      |

> Não introduzir dependências fora desta stack sem alinhamento explícito.

---

## Estrutura de Pastas

```
zelo-clinic/
├── .env.local
├── next.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── app/                        ← App Router (Next.js 16)
    │   ├── layout.tsx              ← Root layout + QueryClientProvider
    │   ├── page.tsx                ← Redirect para /dashboard
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   └── (main)/
    │       ├── layout.tsx          ← Layout com sidebar + requireClinicAdmin
    │       ├── dashboard/page.tsx
    │       ├── patients/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── users/              ← Cuidadores e familiares da clínica
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── shifts/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── checklists/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── sos/
    │       │   └── page.tsx
    │       ├── reports/
    │       │   └── page.tsx
    │       └── settings/
    │           └── page.tsx
    │
    ├── components/
    │   ├── ui/                     ← shadcn/ui — NÃO MODIFICAR
    │   ├── layout/                 ← sidebar, topbar, providers
    │   └── shared/                 ← componentes compartilhados entre features
    │
    ├── features/                   ← lógica + componentes por domínio
    │   └── [domínio]/
    │       ├── index.ts            ← barrel: re-exporta tudo do domínio
    │       ├── components/
    │       │   ├── index.ts
    │       │   └── ...
    │       ├── hooks/
    │       │   ├── index.ts
    │       │   └── ...
    │       ├── services/
    │       │   ├── index.ts
    │       │   └── ...
    │       └── types/
    │           └── index.ts
    │
    ├── lib/
    │   ├── api.ts                  ← cliente HTTP base (fetch com token JWT via cookie)
    │   ├── auth.ts                 ← helpers de autenticação (requireClinicAdmin)
    │   └── utils.ts                ← cn() e utilitários gerais
    │
    ├── store/                      ← Zustand (estado global — ex: auth)
    │   └── authStore.ts
    │
    ├── types/
    │   ├── index.ts
    │   └── auth.ts
    │
    └── utils/
```

---

## Responsabilidades por camada

| Camada                 | Responsabilidade                                      |
| ---------------------- | ----------------------------------------------------- |
| `app/`                 | Rotas e páginas — sem lógica de negócio               |
| `features/*/services/` | Única camada que chama a API Django                   |
| `features/*/hooks/`    | `useQuery` / `useMutation` — alimenta a UI            |
| `lib/api.ts`           | Cliente HTTP com base URL e token JWT                 |
| `store/`               | Estado global que não vem da API (auth, preferências) |
| `components/ui/`       | Primitivos shadcn/ui — não modificar                  |

---

## Padrões obrigatórios

### `lib/api.ts`

- Cliente HTTP base com `fetch`
- Injeta `Authorization: Bearer <token>` via cookie `ze_access` (Server) ou store (Client)
- Lança erro se `res.ok === false`
- Base URL via `NEXT_PUBLIC_API_URL`

### Services

- Vivem em `features/[domínio]/services/`
- Só importam de `@/lib/api`
- Sem lógica de UI, sem hooks do React
- Funções assíncronas puras com tipos explícitos

### Hooks

- Vivem em `features/[domínio]/hooks/`
- `useQuery` para leitura, `useMutation` para escrita
- `useMutation` sempre chama `invalidateQueries` no `onSuccess`
- Nunca usar `useState` + `useEffect` para buscar dados

### Formulários

- React Hook Form + Zod
- Validação: `.issues[0].message`
- Mutações retornam `{ success: boolean; error?: string }`
- Use `startTransition` para async state updates

### Store (Zustand)

- Apenas estado que não vem da API
- Sem chamadas de API dentro da store
- Ações nomeadas com verbos: `set`, `reset`, `clear`

### Componentes

- Named exports — sem default export (exceto arquivos de rota)
- Props tipadas com `interface` explícita
- Nunca `any` — use `unknown` ou tipo explícito
- Server Components por padrão — `'use client'` só quando necessário

---

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_API_URL=http://10.220.0.27:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Permissões

Este painel é exclusivo para usuários com role `clinic_admin`. A autenticação usa JWT via cookie `ze_access`. O middleware e `requireClinicAdmin()` garantem que apenas usuários autorizados acessem as rotas `(main)`.

---

## O que nunca fazer

- ❌ `any` no TypeScript — use `unknown` ou tipo explícito
- ❌ Chamar `fetch` diretamente em componentes ou páginas
- ❌ Chamar a API Django fora de `features/*/services/`
- ❌ Modificar arquivos em `components/ui/` (shadcn)
- ❌ Lógica de negócio dentro de stores Zustand
- ❌ Default export em componentes
- ❌ `useState` + `useEffect` para buscar dados — use `useQuery`
- ❌ Acessar `process.env` diretamente fora de `lib/`

---

## Comandos

```bash
npm run dev        # Desenvolvimento (porta 3001)
npm run build      # Build de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

---

_Última atualização: 2026-06-18_
