"use client";

import { useState } from "react";
import { FileText, Download, Clock, ChevronDown, ChevronUp, AlertTriangle, Heart, ClipboardList, Star, Calendar, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientRecord } from "../hooks";
import { getPatientRecordExportUrl } from "../services";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  checklist_completed: <ClipboardList className="h-4 w-4 text-green-600" />,
  checklist_in_progress: <ClipboardList className="h-4 w-4 text-blue-600" />,
  shift_started: <Clock className="h-4 w-4 text-blue-600" />,
  shift_ended: <Check className="h-4 w-4 text-green-600" />,
  shift_cancelled: <X className="h-4 w-4 text-red-600" />,
  sos_triggered: <AlertTriangle className="h-4 w-4 text-red-600" />,
  sos_acknowledged: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  sos_resolved: <AlertTriangle className="h-4 w-4 text-green-600" />,
  health_alert_open: <Heart className="h-4 w-4 text-red-600" />,
  health_alert_resolved: <Heart className="h-4 w-4 text-green-600" />,
  rating_given: <Star className="h-4 w-4 text-yellow-600" />,
  contract_active: <FileText className="h-4 w-4 text-green-600" />,
  contract_suspended: <FileText className="h-4 w-4 text-orange-600" />,
  contract_cancelled: <FileText className="h-4 w-4 text-red-600" />,
};

function getEventIcon(event_type: string): React.ReactNode {
  return EVENT_ICONS[event_type] || <Calendar className="h-4 w-4 text-gray-600" />;
}

function getStatusBadge(status: string): React.ReactNode {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TimelineEntry({ entry }: { entry: { event_type: string; timestamp: string; title: string; description: string; actor_name: string; data: Record<string, unknown> } }) {
  const [expanded, setExpanded] = useState(false);
  const d = entry.data as Record<string, unknown>;
  const hasExtra = Object.keys(d).length > 0 && (
    (d.status != null) || (d.items != null) || (d.notes != null) || (d.details != null)
  );

  return (
    <div className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
      <div className="absolute -left-3 top-0 bg-white p-0.5 rounded-full">
        {getEventIcon(entry.event_type)}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
          <p className="text-xs text-gray-500">
            {formatTimestamp(entry.timestamp)}
            {entry.actor_name && ` — ${entry.actor_name}`}
          </p>
          {entry.description && (
            <p className="text-xs text-gray-600 mt-0.5">{entry.description}</p>
          )}
        </div>
        {hasExtra && (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0 p-1 hover:bg-gray-100 rounded">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>
      {expanded && hasExtra && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
          {!!d.status && <p>Status: {String(d.status)}</p>}
          {!!d.details && <p>{String(d.details)}</p>}
          {!!d.notes && <p>Observações: {String(d.notes)}</p>}
          {Array.isArray(d.items) && (
            <div>
              <p className="font-medium mt-1">Itens:</p>
              {(d.items as Array<any>).map((item: any, i: number) => (
                <div key={i} className="ml-2">
                  <span>{String(item.item_name ?? "")}: </span>
                  {item.checked !== null && item.checked !== undefined
                    ? <span className={item.checked ? "text-green-600" : "text-red-600"}>{item.checked ? "✓" : "✗"}</span>
                    : <span>{String(item.value ?? "")}</span>
                  }
                  {item.observation && <span className="text-gray-400"> ({String(item.observation)})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TYPE_FILTERS = [
  { value: "", label: "Todos" },
  { value: "checklist", label: "Checklists" },
  { value: "shift", label: "Turnos" },
  { value: "sos", label: "SOS" },
  { value: "health_alert", label: "Alertas" },
  { value: "rating", label: "Avaliações" },
];

function filterTimeline(timeline: Array<{ event_type: string }>, filter: string): Array<{ event_type: string; timestamp: string; title: string; description: string; actor_name: string; data: Record<string, unknown> }> {
  if (!filter) return timeline as any;
  return (timeline as any[]).filter(e => e.event_type.startsWith(filter));
}

interface PatientRecordSectionProps {
  patientId: string;
}

export function PatientRecordSection({ patientId }: PatientRecordSectionProps) {
  const { data: record, isLoading } = usePatientRecord(patientId);
  const [filter, setFilter] = useState("");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar prontuário.</p>
        </CardContent>
      </Card>
    );
  }

  const filteredTimeline = filterTimeline(record.timeline, filter);
  const pdfUrl = getPatientRecordExportUrl(patientId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário
          </CardTitle>
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </a>
        </div>
        <CardDescription>
          {record.patient.clinic_name && `${record.patient.clinic_name} · `}
          {record.patient.blood_type && `Tipo sanguíneo: ${record.patient.blood_type}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados de Saúde */}
        {(record.patient.health_conditions || record.patient.allergies || record.patient.medications) && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm space-y-2">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Dados de Saúde
            </h4>
            {record.patient.health_conditions && (
              <p><span className="font-medium">Condições:</span> {record.patient.health_conditions}</p>
            )}
            {record.patient.allergies && (
              <p><span className="font-medium">Alergias:</span> {record.patient.allergies}</p>
            )}
            {record.patient.medications && (
              <p><span className="font-medium">Medicações:</span> {record.patient.medications}</p>
            )}
            {record.patient.health_status && (
              <p><span className="font-medium">Validação:</span> {record.patient.health_status === "validated" ? "Validado" : record.patient.health_status === "declared" ? "Declarado" : "Pendente"}</p>
            )}
          </div>
        )}

        {/* Contratos */}
        {record.contracts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Contratos</h4>
            <div className="space-y-2">
              {record.contracts.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{c.contract_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.weekly_hours}h/sem · R$ {c.price_per_hour}/h · Início: {c.start_date}
                    </p>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plano de Cuidado */}
        {record.care_plan && (
          <div className="rounded-lg bg-green-50 p-4 text-sm">
            <h4 className="font-semibold text-green-900 mb-1">Plano de Cuidado</h4>
            <p>Responsável: {(record.care_plan as any).responsible_name}</p>
            <p>Registro: {(record.care_plan as any).responsible_register}</p>
          </div>
        )}

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Linha do Tempo ({filteredTimeline.length} eventos)
            </h4>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    filter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2">
            {filteredTimeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento encontrado.</p>
            ) : (
              filteredTimeline.slice(0, 100).map((entry, idx) => (
                <TimelineEntry key={`${entry.event_type}-${entry.timestamp}-${idx}`} entry={entry} />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
