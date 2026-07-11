"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CarePlanChecklistItem, CarePlanChecklistOverride } from "../types";

export function ItemMetaBadge({ item }: { item: CarePlanChecklistItem }) {
  const labels: string[] = [];
  if (item.criticality === "high") labels.push("Alta");
  if (item.requires_photo) labels.push("Foto");
  if (item.type === "number" && item.unit) labels.push(item.unit);
  if (item.frequency === "fixed_times" && item.scheduled_times.length > 0) {
    labels.push(`${item.scheduled_times.length} horários`);
  }
  if (labels.length === 0) return null;
  return (
    <>
      {labels.map((l) => (
        <Badge key={l} variant="outline" className="text-[10px]">
          {l}
        </Badge>
      ))}
    </>
  );
}

interface Props {
  item: CarePlanChecklistItem;
  override?: CarePlanChecklistOverride;
  onSetOverride: (override: CarePlanChecklistOverride) => void;
  onRemoveOverride: () => void;
}

/**
 * Editor de um item do checklist dentro do plano: permite inativar o item e
 * sobrescrever faixa esperada (número) e horários (horários fixos). Usado tanto
 * na montagem (admin) quanto na curadoria (enfermeiro).
 */
export function ChecklistItemOverrideEditor({
  item,
  override,
  onSetOverride,
  onRemoveOverride,
}: Props) {
  const isInactive = override?.is_active === false;
  return (
    <div className="space-y-1.5 rounded-md border p-2 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <span className={cn("font-medium", isInactive && "text-muted-foreground line-through")}>
            {item.name}
          </span>
          <div className="mt-0.5 flex flex-wrap gap-1">
            <ItemMetaBadge item={item} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground">Inativo</Label>
          <Switch
            checked={!isInactive}
            onCheckedChange={(v) => {
              if (v) {
                onRemoveOverride();
              } else {
                onSetOverride({ item_id: item.id, is_active: false });
              }
            }}
          />
        </div>
      </div>

      {!isInactive && item.type === "number" && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Min. esperado {item.unit ? `(${item.unit})` : ""}
            </Label>
            <Input
              className="h-7 text-xs"
              type="number"
              step="any"
              placeholder={item.expected_min?.toString() ?? "—"}
              value={override?.expected_min?.toString() ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                onSetOverride({
                  item_id: item.id,
                  expected_min: v === "" ? null : Number(v),
                });
              }}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Máx. esperado {item.unit ? `(${item.unit})` : ""}
            </Label>
            <Input
              className="h-7 text-xs"
              type="number"
              step="any"
              placeholder={item.expected_max?.toString() ?? "—"}
              value={override?.expected_max?.toString() ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                onSetOverride({
                  item_id: item.id,
                  expected_max: v === "" ? null : Number(v),
                });
              }}
            />
          </div>
        </div>
      )}

      {!isInactive && item.frequency === "fixed_times" && (
        <div className="mt-1">
          <Label className="text-[10px] text-muted-foreground">
            Horários (separados por vírgula)
          </Label>
          <Input
            className="h-7 text-xs"
            value={(override?.scheduled_times ?? item.scheduled_times).join(",")}
            onChange={(e) => {
              const times = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              onSetOverride({
                item_id: item.id,
                scheduled_times: times.length > 0 ? times : null,
              });
            }}
            placeholder={item.scheduled_times.join(",") || "08:00,14:00"}
          />
        </div>
      )}
    </div>
  );
}
