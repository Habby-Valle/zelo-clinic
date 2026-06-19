"use client";

import { useState } from "react";
import { Smile, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaterialIcon } from "./material-icon";

interface MaterialIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const ICON_GROUPS = [
  {
    name: "Higiene e Cuidados",
    icons: ["wash", "clean_hands", "bathtub", "shower", "soap", "spa", "facial"],
  },
  {
    name: "Saúde e Monitoramento",
    icons: [
      "monitor_heart",
      "thermostat",
      "bloodtype",
      "ecg_heart",
      "stethoscope",
      "biotech",
      "pulse_alert",
      "infusion",
      "vaccines",
      "pill",
    ],
  },
  {
    name: "Alimentação e Hidratação",
    icons: [
      "restaurant",
      "lunch_dining",
      "water_drop",
      "coffee",
      "bakery_dining",
      "local_cafe",
      "nutrients",
      "rice_bowl",
    ],
  },
  {
    name: "Mobilidade e Exercícios",
    icons: [
      "directions_walk",
      "accessibility_new",
      "elderly",
      "elderly_woman",
      "airport_shuttle",
      "exercise",
      "walking",
    ],
  },
  {
    name: "Sono e Repouso",
    icons: ["bedtime", "bed", "sleep", "hotel", "night_shelter", "airwave"],
  },
  {
    name: "Eliminações",
    icons: ["toilet", "plumbing", "water", "inventory_2", "cleaning_services"],
  },
  {
    name: "Pele e Feridas",
    icons: ["healing", "bandage", "compresses", "wounds", "ointment"],
  },
  {
    name: "Geral",
    icons: [
      "checklist",
      "assignment",
      "description",
      "note_alt",
      "list_alt",
      "task_alt",
      "fact_check",
      "receipt_long",
    ],
  },
];

export function MaterialIconPicker({ value, onChange }: MaterialIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? ICON_GROUPS.map((g) => ({
        ...g,
        icons: g.icons.filter((name) => name.includes(search.toLowerCase().replace(/\s+/g, "_"))),
      })).filter((g) => g.icons.length > 0)
    : ICON_GROUPS;

  function handleSelect(name: string) {
    onChange(name);
    setOpen(false);
    setSearch("");
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn("w-full justify-start", !value && "text-muted-foreground")}
        >
          {value ? (
            <>
              <MaterialIcon name={value} size="sm" />
              <span className="ml-2 capitalize">{value.replace(/_/g, " ")}</span>
            </>
          ) : (
            <>
              <Smile className="mr-2 h-4 w-4" />
              Selecionar ícone
            </>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Selecionar Ícone</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ícones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <div className="max-h-[360px] space-y-4 overflow-y-auto">
            {filtered.map((group) => (
              <div key={group.name}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{group.name}</p>
                <div className="grid grid-cols-8 gap-1">
                  {group.icons.map((name) => {
                    const isSelected = value === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelect(name)}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md text-lg transition-colors hover:bg-accent",
                          isSelected && "bg-primary/10 ring-1 ring-primary"
                        )}
                        title={name.replace(/_/g, " ")}
                      >
                        <MaterialIcon name={name} size="md" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {value && (
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                <MaterialIcon name={value} size="sm" />
                <span className="capitalize">{value.replace(/_/g, " ")}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Remover
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
