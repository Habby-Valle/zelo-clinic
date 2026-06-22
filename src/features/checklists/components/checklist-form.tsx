"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { useCreateChecklist, useUpdateChecklist } from "@/features/checklists/hooks";
import type { ChecklistDetail, ChecklistItemType } from "@/features/checklists/types";
import { SortableItem } from "./sortable-item";
import { MaterialIconPicker } from "@/components/shared/material-icon-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FormItem {
  tempId: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
  has_observation: boolean;
  options: { label: string; value: string }[];
}

interface Props {
  checklist?: ChecklistDetail;
  onSuccess: () => void;
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
      } else {
        await createChecklist.mutateAsync(body);
        toast.success("Checklist criado");
      }
      onSuccess();
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
