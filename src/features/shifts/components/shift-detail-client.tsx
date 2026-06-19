"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  ArrowLeft,
  User,
  Clock,
  Calendar,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react"

import { useShift } from "@/features/shifts/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { finishShift, cancelShift, deleteShift } from "@/app/(main)/shifts/actions"
import type { ShiftItem } from "@/features/shifts/types"

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(start: string, end: string) {
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  if (diffMs < 0) return "—"
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

interface Props {
  id: number
}

export function ShiftDetailClient({ id }: Props) {
  const router = useRouter()
  const { data: shift, isLoading } = useShift(id)
  const [isPending, startTransition] = useTransition()

  function handleAction(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        router.refresh()
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-medium text-muted-foreground">Turno não encontrado</p>
        <Button variant="outline" onClick={() => router.push("/shifts")}>
          Voltar para turnos
        </Button>
      </div>
    )
  }

  const canFinish = shift.status === "in_progress"
  const canCancel = shift.status === "scheduled" || shift.status === "in_progress"
  const canDelete = shift.status === "scheduled"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/shifts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Turno</h1>
          <p className="text-sm text-muted-foreground">#{shift.id}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[shift.status] ?? "outline"} className="text-sm">
          {STATUS_LABELS[shift.status] ?? shift.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-muted-foreground" />
              Cuidador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{shift.caregiver_name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-muted-foreground" />
              Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shift.shift_patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum paciente vinculado</p>
            ) : (
              <ul className="space-y-1">
                {shift.shift_patients.map((p) => (
                  <li key={p.id} className="text-sm font-medium">
                    {p.patient_name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Horário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Início</span>
              <span className="font-medium">{formatDateTime(shift.start)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fim</span>
              <span className="font-medium">{formatDateTime(shift.end)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duração</span>
              <span className="font-medium">{formatDuration(shift.start, shift.end)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {canFinish && (
              <Button
                className="w-full"
                onClick={() => handleAction(() => finishShift(shift.id))}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Finalizar Turno
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleAction(() => cancelShift(shift.id))}
                disabled={isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Turno
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction(() => deleteShift(shift.id))}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Turno
              </Button>
            )}
            {!canFinish && !canCancel && !canDelete && (
              <p className="text-sm text-muted-foreground">
                Nenhuma ação disponível para este status.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {shift.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{shift.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
