"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { useCreateChecklist, useUpdateChecklist } from "@/features/checklists/hooks";
import type { ChecklistDetail, ChecklistItemType, AlertSeverity, Criticality, FrequencyType } from "@/features/checklists/types";
import { SortableItem } from "./sortable-item";
import { MaterialIconPicker } from "@/components/shared/material-icon-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEM_TYPES: { value: ChecklistItemType; label: string }[] = [
  { value: "boolean", label: "Sim/Não" },
  { value: "text", label: "Texto" },
  { value: "select", label: "Seleção" },
  { value: "number", label: "Número" },
];

const CRITICALITY_OPTIONS: { value: Criticality; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

const SEVERITY_OPTIONS: { value: AlertSeverity; label: string }[] = [
  { value: "", label: "Nenhum" },
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "as_needed", label: "Se necessário" },
  { value: "per_shift", label: "Por turno" },
  { value: "daily", label: "Diário" },
  { value: "fixed_times", label: "Horários fixos" },
];

interface FormItem {
  tempId: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
  has_observation: boolean;
  options: { label: string; value: string }[];
  unit: string;
  expected_min: string;
  expected_max: string;
  target_value: string;
  alert_severity: AlertSeverity;
  criticality: Criticality;
  instructions: string;
  requires_photo: boolean;
  frequency: FrequencyType;
  scheduled_times: string[];
}

interface Props {
  checklist?: ChecklistDetail;
  onSuccess: (created?: ChecklistDetail) => void;
}

export function ChecklistForm({ checklist, onSuccess }: Props) {
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist(checklist?.id ?? "");
  const isPending = createChecklist.isPending || updateChecklist.isPending;

  const [name, setName] = useState(checklist?.name ?? "");
  const [icon, setIcon] = useState(checklist?.icon ?? "");
  const [items, setItems] = useState<FormItem[]>(
    () =>
      checklist?.items.map((i) => ({
        tempId: i.id,
        name: i.name,
        type: i.type,
        required: i.required,
        has_observation: i.has_observation,
        options: i.options.map((o) => ({ label: o.label, value: o.value })),
        unit: i.unit ?? "",
        expected_min: i.expected_min?.toString() ?? "",
        expected_max: i.expected_max?.toString() ?? "",
        target_value: i.target_value?.toString() ?? "",
        alert_severity: i.alert_severity ?? "",
        criticality: i.criticality ?? "medium",
        instructions: i.instructions ?? "",
        requires_photo: i.requires_photo ?? false,
        frequency: i.frequency ?? "per_shift",
        scheduled_times: i.scheduled_times ?? [],
      })) ?? []
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        tempId: `new_${Date.now()}`,
        name: "",
        type: "boolean",
        required: false,
        has_observation: false,
        options: [],
        unit: "",
        expected_min: "",
        expected_max: "",
        target_value: "",
        alert_severity: "",
        criticality: "medium",
        instructions: "",
        requires_photo: false,
        frequency: "per_shift",
        scheduled_times: [],
      },
    ]);
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  function updateItem(tempId: string, patch: Partial<FormItem>) {
    setItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, ...patch } : i)));
  }

  function addOption(tempId: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? { ...i, options: [...i.options, { label: "", value: `opt_${Date.now()}` }] }
          : i
      )
    );
  }

  function updateOption(
    tempId: string,
    optIndex: number,
    patch: Partial<{ label: string; value: string }>
  ) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? {
              ...i,
              options: i.options.map((o, idx) => (idx === optIndex ? { ...o, ...patch } : o)),
            }
          : i
      )
    );
  }

  function removeOption(tempId: string, optIndex: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId ? { ...i, options: i.options.filter((_, idx) => idx !== optIndex) } : i
      )
    );
  }

  function addScheduledTime(tempId: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? { ...i, scheduled_times: [...i.scheduled_times, "08:00"] }
          : i
      )
    );
  }

  function updateScheduledTime(tempId: string, idx: number, value: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? { ...i, scheduled_times: i.scheduled_times.map((t, j) => (j === idx ? value : t)) }
          : i
      )
    );
  }

  function removeScheduledTime(tempId: string, idx: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? { ...i, scheduled_times: i.scheduled_times.filter((_, j) => j !== idx) }
          : i
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome do checklist é obrigatório");
      return;
    }

    const body: Record<string, unknown> = {
      name: name.trim(),
      icon: icon || undefined,
      items: items
        .filter((i) => i.name.trim())
        .map((i, idx) => ({
          name: i.name.trim(),
          type: i.type,
          required: i.required,
          has_observation: i.has_observation,
          order: idx,
          unit: i.unit || undefined,
          expected_min: i.expected_min ? Number(i.expected_min) : null,
          expected_max: i.expected_max ? Number(i.expected_max) : null,
          target_value: i.target_value ? Number(i.target_value) : null,
          alert_severity: i.alert_severity || undefined,
          criticality: i.criticality,
          instructions: i.instructions || undefined,
          requires_photo: i.requires_photo,
          frequency: i.frequency,
          scheduled_times: i.frequency === "fixed_times" ? i.scheduled_times : [],
          options:
            i.type === "select"
              ? i.options
                  .filter((o) => o.label.trim())
                  .map((o) => ({ label: o.label.trim(), value: o.label.trim() }))
              : undefined,
        })),
    };

    try {
      if (checklist) {
        await updateChecklist.mutateAsync(body);
        toast.success("Checklist atualizado");
        onSuccess();
      } else {
        const created = await createChecklist.mutateAsync(body);
        toast.success("Checklist criado");
        onSuccess(created);
      }
    } catch {
      toast.error("Erro ao salvar checklist");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cl-name">Nome *</Label>
          <Input
            id="cl-name"
            placeholder="Ex: Checklist de Higiene"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ícone</Label>
          <MaterialIconPicker value={icon} onChange={setIcon} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Itens do Checklist</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-3 w-3" />
            Adicionar Item
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum item adicionado. Clique em &ldquo;Adicionar Item&rdquo; para começar.
          </p>
        )}

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <SortableItem key={item.tempId} id={String(index)}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      Item {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.tempId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pergunta *</Label>
                      <Input
                        placeholder="Ex: O paciente tomou banho?"
                        value={item.name}
                        onChange={(e) => updateItem(item.tempId, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tipo</Label>
                      <Select
                        value={item.type}
                        onValueChange={(v) =>
                          updateItem(item.tempId, { type: (v ?? "boolean") as ChecklistItemType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(v: string | null) => {
                              const t = ITEM_TYPES.find((t) => t.value === v);
                              return t?.label ?? v;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`required-${item.tempId}`}
                        checked={item.required}
                        onCheckedChange={(v) => updateItem(item.tempId, { required: v === true })}
                      />
                      <Label
                        htmlFor={`required-${item.tempId}`}
                        className="cursor-pointer text-xs font-normal"
                      >
                        Obrigatório
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`obs-${item.tempId}`}
                        checked={item.has_observation}
                        onCheckedChange={(v) =>
                          updateItem(item.tempId, { has_observation: v === true })
                        }
                      />
                      <Label
                        htmlFor={`obs-${item.tempId}`}
                        className="cursor-pointer text-xs font-normal"
                      >
                        Permite observação
                      </Label>
                    </div>
                  </div>

                  {/* ── Fase 1: Criticalidade, Instruções, Foto ── */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Criticalidade</Label>
                      <Select
                        value={item.criticality}
                        onValueChange={(v) =>
                          updateItem(item.tempId, { criticality: (v ?? "medium") as Criticality })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {CRITICALITY_OPTIONS.find((o) => o.value === item.criticality)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {CRITICALITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 pt-5">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`photo-${item.tempId}`}
                          checked={item.requires_photo}
                          onCheckedChange={(v) =>
                            updateItem(item.tempId, { requires_photo: v === true })
                          }
                        />
                        <Label htmlFor={`photo-${item.tempId}`} className="cursor-pointer text-xs font-normal">
                          Requer foto
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <Label className="text-xs">Instruções para o cuidador</Label>
                    <Textarea
                      placeholder="Ex: Medir pressão com paciente sentado e em repouso por 5 min."
                      value={item.instructions}
                      onChange={(e) => updateItem(item.tempId, { instructions: e.target.value })}
                      className="min-h-[60px] text-sm"
                    />
                  </div>

                  {/* ── Fase 1: Campos para tipo número ── */}
                  {item.type === "number" && (
                    <div className="mt-3 rounded-lg border p-3">
                      <span className="mb-2 block text-xs font-medium text-muted-foreground">
                        Faixa esperada
                      </span>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Unidade</Label>
                          <Input
                            placeholder="ex: mmHg"
                            value={item.unit}
                            onChange={(e) => updateItem(item.tempId, { unit: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Min</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={item.expected_min}
                            onChange={(e) => updateItem(item.tempId, { expected_min: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Max</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={item.expected_max}
                            onChange={(e) => updateItem(item.tempId, { expected_max: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Severidade</Label>
                          <Select
                            value={item.alert_severity}
                            onValueChange={(v) =>
                              updateItem(item.tempId, { alert_severity: (v ?? "") as AlertSeverity })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue>
                                {SEVERITY_OPTIONS.find((o) => o.value === item.alert_severity)?.label}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {SEVERITY_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Fase 2: Frequência e horários ── */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Frequência</Label>
                      <Select
                        value={item.frequency}
                        onValueChange={(v) =>
                          updateItem(item.tempId, { frequency: (v ?? "per_shift") as FrequencyType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {FREQUENCY_OPTIONS.find((o) => o.value === item.frequency)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {item.frequency === "fixed_times" && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Horários</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addScheduledTime(item.tempId)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Adicionar horário
                        </Button>
                      </div>
                      {item.scheduled_times.length === 0 && (
                        <p className="text-xs text-muted-foreground">Nenhum horário definido.</p>
                      )}
                      {item.scheduled_times.map((time, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updateScheduledTime(item.tempId, tIdx, e.target.value)}
                            className="h-8 w-32 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => removeScheduledTime(item.tempId, tIdx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Opções (select) ── */}
                  {item.type === "select" && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Opções</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addOption(item.tempId)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Adicionar
                        </Button>
                      </div>
                      {item.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <Input
                            placeholder="Opção"
                            value={opt.label}
                            onChange={(e) =>
                              updateOption(item.tempId, optIdx, {
                                label: e.target.value,
                                value: e.target.value,
                              })
                            }
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => removeOption(item.tempId, optIdx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending || !name.trim()}>
          {checklist ? "Salvar alterações" : "Criar Checklist"}
        </Button>
      </div>
    </form>
  );
}
