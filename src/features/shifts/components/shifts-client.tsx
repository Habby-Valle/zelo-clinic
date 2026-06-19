"use client"

import { useState, useCallback } from "react"
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Trash2,
  Pencil,
  FileText,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  useShifts,
  useShiftTemplates,
  useClinicPatients,
  useClinicCaregivers,
  useChecklistOptions,
} from "../hooks"
import {
  createShift,
  finishShift,
  cancelShift,
  deleteShift,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
} from "@/app/(main)/shifts/actions"
import type { ShiftTemplateItem, ShiftFilters } from "../types"

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  if (diffMs < 0) return "—"
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

export function ShiftsClient() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState("shifts")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filters: ShiftFilters = { search, status: statusFilter, page, page_size: pageSize }
  const shiftsQuery = useShifts(filters)
  const templatesQuery = useShiftTemplates()
  const patientsQuery = useClinicPatients()
  const caregiversQuery = useClinicCaregivers()
  const checklistsQuery = useChecklistOptions()

  const shifts = shiftsQuery.data?.shifts ?? []
  const shiftsTotal = shiftsQuery.data?.total ?? 0
  const templates = templatesQuery.data ?? []
  const patients = patientsQuery.data ?? []
  const caregivers = caregiversQuery.data ?? []
  const checklistOptions = checklistsQuery.data ?? []

  // Create shift dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([])
  const [formPatient, setFormPatient] = useState("")
  const [formCaregiver, setFormCaregiver] = useState("")
  const [formTemplate, setFormTemplate] = useState("")
  const [formStart, setFormStart] = useState("")
  const [formEnd, setFormEnd] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const filteredPatients = formCaregiver
    ? patients.filter((p) => p.caregiver_ids.includes(parseInt(formCaregiver)))
    : []

  // Template CRUD dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplateItem | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [tplName, setTplName] = useState("")
  const [tplStart, setTplStart] = useState("07:00")
  const [tplEnd, setTplEnd] = useState("19:00")
  const [tplInstructions, setTplInstructions] = useState("")

  // Confirm actions
  const [confirmAction, setConfirmAction] = useState<{
    type: "finish" | "cancel" | "delete"
    shiftId: number
  } | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const invalidateShifts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["shifts"] })
  }, [queryClient])

  const invalidateTemplates = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["shift-templates"] })
  }, [queryClient])

  function onTabChange(value: string) {
    setTab(value)
    setPage(1)
  }

  function openCreateDialog() {
    setCreateOpen(true)
    setFormPatient("")
    setFormCaregiver("")
    setFormTemplate("")
    setFormNotes("")
    setSelectedChecklists([])
    const now = new Date()
    now.setSeconds(0, 0)
    const later = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    setFormStart(now.toISOString().slice(0, 16))
    setFormEnd(later.toISOString().slice(0, 16))
  }

  function handleTemplateSelect(value: string | null) {
    const v = value ?? ""
    setFormTemplate(v)
    const tpl = templates.find((t) => String(t.id) === v)
    if (tpl) {
      setFormNotes(tpl.instructions ?? "")
      const now = new Date()
      const [sh, sm] = tpl.start_time.split(":")
      const [eh, em] = tpl.end_time.split(":")
      now.setHours(parseInt(sh), parseInt(sm), 0, 0)
      const startStr = now.toISOString().slice(0, 16)
      now.setHours(parseInt(eh), parseInt(em), 0, 0)
      const endStr = now.toISOString().slice(0, 16)
      if (
        parseInt(eh) > parseInt(sh) ||
        (parseInt(eh) === parseInt(sh) && parseInt(em) > parseInt(sm))
      ) {
        setFormStart(startStr)
        setFormEnd(endStr)
      }
    }
  }

  async function handleCreateShift(e: React.FormEvent) {
    e.preventDefault()
    if (!formCaregiver || !formStart || !formEnd) return
    setCreateLoading(true)
    const result = await createShift({
      caregiver_id: parseInt(formCaregiver),
      start: new Date(formStart).toISOString(),
      end: new Date(formEnd).toISOString(),
      notes: formNotes || undefined,
      patient_id: formPatient ? parseInt(formPatient) : undefined,
      checklist_ids: selectedChecklists.length > 0 ? selectedChecklists : undefined,
    })
    if (result.success) {
      setCreateOpen(false)
      invalidateShifts()
    }
    setCreateLoading(false)
  }

  async function handleConfirmAction() {
    if (!confirmAction) return
    setConfirmLoading(true)
    let result: { success: boolean; error?: string }
    if (confirmAction.type === "finish") result = await finishShift(confirmAction.shiftId)
    else if (confirmAction.type === "cancel") result = await cancelShift(confirmAction.shiftId)
    else result = await deleteShift(confirmAction.shiftId)
    if (result.success) {
      setConfirmAction(null)
      invalidateShifts()
    }
    setConfirmLoading(false)
  }

  function resetTemplateForm() {
    setTplName("")
    setTplStart("07:00")
    setTplEnd("19:00")
    setTplInstructions("")
    setEditingTemplate(null)
  }

  function openTemplateCreate() {
    resetTemplateForm()
    setTemplateDialogOpen(true)
  }

  function openTemplateEdit(tpl: ShiftTemplateItem) {
    setEditingTemplate(tpl)
    setTplName(tpl.name)
    setTplStart(tpl.start_time.slice(0, 5))
    setTplEnd(tpl.end_time.slice(0, 5))
    setTplInstructions(tpl.instructions ?? "")
    setTemplateDialogOpen(true)
  }

  async function handleTemplateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tplName.trim() || !tplStart || !tplEnd) return
    setTemplateLoading(true)
    let result: { success: boolean; error?: string }
    if (editingTemplate) {
      result = await updateShiftTemplate({
        id: editingTemplate.id,
        name: tplName.trim(),
        start_time: tplStart,
        end_time: tplEnd,
        instructions: tplInstructions || undefined,
        is_active: editingTemplate.is_active,
      })
    } else {
      result = await createShiftTemplate({
        name: tplName.trim(),
        start_time: tplStart,
        end_time: tplEnd,
        instructions: tplInstructions || undefined,
      })
    }
    if (result.success) {
      setTemplateDialogOpen(false)
      resetTemplateForm()
      invalidateTemplates()
    }
    setTemplateLoading(false)
  }

  async function handleToggleTemplate(tpl: ShiftTemplateItem) {
    await updateShiftTemplate({
      id: tpl.id,
      name: tpl.name,
      start_time: tpl.start_time.slice(0, 5),
      end_time: tpl.end_time.slice(0, 5),
      instructions: tpl.instructions || undefined,
      is_active: !tpl.is_active,
    })
    invalidateTemplates()
  }

  async function handleDeleteTemplate(id: number) {
    await deleteShiftTemplate(id)
    invalidateTemplates()
  }

  const shiftsTotalPages = Math.ceil(shiftsTotal / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
          <p className="mt-1 text-muted-foreground">
            Gestão de turnos de cuidado da clínica.
          </p>
        </div>
        {tab === "shifts" && (
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Turno
          </Button>
        )}
        {tab === "templates" && (
          <Button onClick={openTemplateCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="shifts">
            <Calendar className="mr-2 h-4 w-4" />
            Turnos
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Turnos tab */}
        <TabsContent value="shifts" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar cuidador..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="max-w-xs"
            />
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => {
                setStatusFilter((v ?? "") === "all" ? "" : (v ?? ""))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Cuidador</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftsQuery.isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Calendar className="h-8 w-8" />
                          <p>Nenhum turno encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {shift.shift_patients[0]?.patient_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {shift.caregiver_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(shift.start)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(shift.end)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDuration(shift.start, shift.end)}
                        </TableCell>
                        <TableCell>
                          {shift.status === "scheduled" &&
                          new Date(shift.start) > new Date() ? (
                            <Badge variant="outline">Aguardando início</Badge>
                          ) : (
                            <Badge variant={STATUS_VARIANTS[shift.status] ?? "outline"}>
                              {STATUS_LABELS[shift.status] ?? shift.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {shift.status === "in_progress" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() =>
                                  setConfirmAction({ type: "finish", shiftId: shift.id })
                                }
                                title="Finalizar"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() =>
                                  setConfirmAction({ type: "cancel", shiftId: shift.id })
                                }
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {shift.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() =>
                                setConfirmAction({ type: "delete", shiftId: shift.id })
                              }
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {shiftsTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a{" "}
                {Math.min(page * pageSize, shiftsTotal)} de {shiftsTotal} turnos
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
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= shiftsTotalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Templates tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Instruções</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="h-8 w-8" />
                          <p>Nenhum template encontrado</p>
                          <Button variant="outline" size="sm" onClick={openTemplateCreate}>
                            Criar primeiro template
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((tpl) => (
                      <TableRow key={tpl.id}>
                        <TableCell className="font-medium">{tpl.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {tpl.start_time.slice(0, 5)} – {tpl.end_time.slice(0, 5)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {tpl.instructions || "—"}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={tpl.is_active}
                            onCheckedChange={() => handleToggleTemplate(tpl)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openTemplateEdit(tpl)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Shift Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Novo Turno</DialogTitle>
            <DialogDescription>
              Registre um novo turno de cuidados.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShift} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Template (opcional)</Label>
              <Select value={formTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter((t) => t.is_active).length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Nenhum template disponível
                    </SelectItem>
                  ) : (
                    templates
                      .filter((t) => t.is_active)
                      .map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Preenche horário e observações automaticamente
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Cuidador *</Label>
              <Select
                value={formCaregiver}
                onValueChange={(v) => {
                  const val = v ?? ""
                  setFormCaregiver(val)
                  if (
                    formPatient &&
                    !patients
                      .find((p) => p.id === parseInt(formPatient))
                      ?.caregiver_ids.includes(parseInt(val))
                  ) {
                    setFormPatient("")
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cuidador" />
                </SelectTrigger>
                <SelectContent>
                  {caregivers.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Nenhum cuidador disponível
                    </SelectItem>
                  ) : (
                    caregivers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <Select
                value={formPatient}
                onValueChange={(v) => setFormPatient(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      formCaregiver
                        ? "Selecione o paciente"
                        : "Selecione um cuidador primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {!formCaregiver ? (
                    <SelectItem value="_empty" disabled>
                      Selecione um cuidador primeiro
                    </SelectItem>
                  ) : filteredPatients.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Nenhum paciente vinculado a este cuidador
                    </SelectItem>
                  ) : (
                    filteredPatients.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formCaregiver && filteredPatients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Vincule pacientes a este cuidador na tela do paciente.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="shift-start">Início *</Label>
                <Input
                  id="shift-start"
                  type="datetime-local"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shift-end">Fim *</Label>
                <Input
                  id="shift-end"
                  type="datetime-local"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shift-notes">Observações</Label>
              <Textarea
                id="shift-notes"
                placeholder="Instruções ou observações para este turno..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
              />
            </div>

            {checklistOptions.length > 0 && (
              <div className="space-y-2 rounded-lg border p-3">
                <Label>Checklists para o cuidador</Label>
                <p className="text-xs text-muted-foreground">
                  Selecione os checklists que o cuidador deve executar neste turno.
                </p>
                <div className="space-y-1.5">
                  {checklistOptions.map((cl) => (
                    <div key={cl.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cl-${cl.id}`}
                        checked={selectedChecklists.includes(cl.id)}
                        onCheckedChange={(v) => {
                          if (v === true) {
                            setSelectedChecklists((prev) => [...prev, cl.id])
                          } else {
                            setSelectedChecklists((prev) =>
                              prev.filter((id) => id !== cl.id)
                            )
                          }
                        }}
                      />
                      <Label
                        htmlFor={`cl-${cl.id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {cl.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createLoading || !formCaregiver || !formStart || !formEnd}
              >
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Turno
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template CRUD Dialog */}
      <Dialog
        open={templateDialogOpen}
        onOpenChange={(open) => {
          setTemplateDialogOpen(open)
          if (!open) resetTemplateForm()
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              Configure horários e instruções padrão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">Nome *</Label>
              <Input
                id="tpl-name"
                placeholder="Ex: Turno Manhã"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-start">Início *</Label>
                <Input
                  id="tpl-start"
                  type="time"
                  value={tplStart}
                  onChange={(e) => setTplStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-end">Fim *</Label>
                <Input
                  id="tpl-end"
                  type="time"
                  value={tplEnd}
                  onChange={(e) => setTplEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-instructions">Instruções</Label>
              <Textarea
                id="tpl-instructions"
                placeholder="Instruções padrão..."
                value={tplInstructions}
                onChange={(e) => setTplInstructions(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTemplateDialogOpen(false)
                  resetTemplateForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={templateLoading || !tplName.trim() || !tplStart || !tplEnd}
              >
                {templateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "finish"
                ? "Finalizar turno?"
                : confirmAction?.type === "cancel"
                  ? "Cancelar turno?"
                  : "Excluir turno?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "finish"
                ? "O turno será marcado como concluído."
                : confirmAction?.type === "cancel"
                  ? "O turno será cancelado. Os dados serão preservados."
                  : "O turno será permanentemente removido."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={confirmLoading}
              className={
                confirmAction?.type !== "finish"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmLoading ? "Aguarde..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
