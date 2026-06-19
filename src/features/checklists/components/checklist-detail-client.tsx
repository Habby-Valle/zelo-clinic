"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CheckSquare, ListChecks, Pencil, Trash2, Loader2, Settings, Copy } from "lucide-react"
import { toast } from "sonner"

import { useChecklist, useUpdateChecklist, useDeleteChecklist, useDuplicateChecklist } from "@/features/checklists/hooks"
import type { ChecklistDetail } from "@/features/checklists/types"
import { MaterialIcon } from "@/components/shared/material-icon"
import { MaterialIconPicker } from "@/components/shared/material-icon-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ITEM_TYPE_LABELS: Record<string, string> = {
  boolean: "Sim/Não",
  text: "Texto",
  number: "Número",
  select: "Seleção",
}

interface Props {
  id: number
}

export function ChecklistDetailClient({ id }: Props) {
  const router = useRouter()
  const { data: checklist, isLoading } = useChecklist(id)
  const deleteChecklist = useDeleteChecklist()
  const duplicateChecklist = useDuplicateChecklist()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <ChecklistDetailSkeleton />

  if (!checklist) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
        <ListChecks className="h-12 w-12" />
        <p className="text-lg">Checklist não encontrado</p>
        <Button variant="outline" onClick={() => router.push("/checklists")}>
          Voltar
        </Button>
      </div>
    )
  }

  const items = checklist.items ?? []
  const isGlobal = checklist.clinic_id === null
  const isMine = !isGlobal

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/checklists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {checklist.icon ? (
              <MaterialIcon name={checklist.icon} className="text-primary" size="lg" />
            ) : (
              <ListChecks className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{checklist.name}</h1>
              <Badge variant={isGlobal ? "default" : "secondary"}>
                {isGlobal ? "Global" : "Da clínica"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <CheckSquare className="mr-1 inline-block h-3.5 w-3.5" />
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isMine ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={duplicateChecklist.isPending}
            onClick={() =>
              duplicateChecklist.mutate(id, {
                onSuccess: () => {
                  toast.success("Checklist duplicado para a clínica")
                  router.push("/checklists")
                },
                onError: () => toast.error("Erro ao duplicar checklist"),
              })
            }
          >
            {duplicateChecklist.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Duplicar para clínica
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Origem
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {isGlobal ? "Global" : "Da clínica"}
            </p>
            {checklist.clinic_name && (
              <p className="text-xs text-muted-foreground">{checklist.clinic_name}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criado em
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(checklist.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4" />
            Itens do Checklist ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item cadastrado neste checklist.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items
                    .sort((a, b) => a.order - b.order)
                    .map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ITEM_TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.required ? (
                            <Badge variant="destructive">Sim</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.has_observation ? (
                            <Badge variant="secondary">Sim</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.type === "select" && item.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.options.slice(0, 3).map((opt) => (
                                <Badge key={opt.id} variant="outline" className="text-xs">
                                  {opt.label}
                                </Badge>
                              ))}
                              {item.options.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.options.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Checklist</DialogTitle>
          </DialogHeader>
          <EditForm checklist={checklist} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteChecklist.isPending}
              onClick={async () => {
                try {
                  await deleteChecklist.mutateAsync(id)
                  toast.success("Checklist excluído")
                  router.push("/checklists")
                } catch {
                  toast.error("Erro ao excluir checklist")
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChecklist.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EditForm({
  checklist,
  onSuccess,
}: {
  checklist: ChecklistDetail
  onSuccess: () => void
}) {
  const updateChecklist = useUpdateChecklist(checklist.id)
  const [name, setName] = useState(checklist.name)
  const [icon, setIcon] = useState(checklist.icon ?? "")
  const [isActive, setIsActive] = useState(checklist.is_active)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await updateChecklist.mutateAsync({
        name: name.trim(),
        icon: icon || undefined,
        is_active: isActive,
      })
      toast.success("Checklist atualizado")
      onSuccess()
    } catch {
      toast.error("Erro ao atualizar")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Ícone</Label>
          <MaterialIconPicker value={icon} onChange={setIcon} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="edit-active"
          checked={isActive}
          onCheckedChange={(v) => setIsActive(v === true)}
        />
        <Label htmlFor="edit-active" className="cursor-pointer font-normal">
          Ativo
        </Label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={updateChecklist.isPending || !name.trim()}>
          {updateChecklist.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  )
}

function ChecklistDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex flex-1 items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
