"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMyFeedbacks } from "../hooks"
import type { FeedbackFilters } from "../types"

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Melhoria",
  compliment: "Elogio",
  other: "Outro",
}

const TYPE_FILTER_LABELS: Record<string, string> = {
  all: "Todos",
  bug: "Bug",
  feature: "Melhoria",
  compliment: "Elogio",
  other: "Outro",
}

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "Todos",
  received: "Recebido",
  in_review: "Em Análise",
  resolved: "Resolvido",
  closed: "Fechado",
}

const TYPE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  bug: "destructive",
  feature: "default",
  compliment: "secondary",
  other: "outline",
}

const STATUS_LABELS: Record<string, string> = {
  received: "Recebido",
  in_review: "Em Análise",
  resolved: "Resolvido",
  closed: "Fechado",
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  received: "secondary",
  in_review: "outline",
  resolved: "default",
  closed: "outline",
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function FeedbackListClient() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const filters: FeedbackFilters = useMemo(
    () => ({
      type: typeFilter as FeedbackFilters["type"],
      status: statusFilter as FeedbackFilters["status"],
      page,
      page_size: 10,
    }),
    [typeFilter, statusFilter, page]
  )

  const { data, isLoading } = useMyFeedbacks(filters)

  const feedbacks = data?.feedbacks ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 10))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Meus Feedbacks</h2>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue>
                {(v: string | null) => TYPE_FILTER_LABELS[v ?? "all"] ?? "Tipo"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Melhoria</SelectItem>
              <SelectItem value="compliment">Elogio</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v ?? "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue>
                {(v: string | null) =>
                  STATUS_FILTER_LABELS[v ?? "all"] ?? "Status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="in_review">Em Análise</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Tipo</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum feedback encontrado
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell>
                    <Badge variant={TYPE_VARIANTS[fb.type] ?? "outline"}>
                      {TYPE_LABELS[fb.type] ?? fb.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-1">{fb.subject}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[fb.status] ?? "outline"}>
                      {STATUS_LABELS[fb.status] ?? fb.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(fb.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, total)} de{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
