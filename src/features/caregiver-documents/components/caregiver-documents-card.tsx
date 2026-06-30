"use client";

import { useState } from "react";
import { FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useCaregiverDocuments,
  useCreateCaregiverDocument,
  useDeleteCaregiverDocument,
} from "../hooks";
import { uploadDocumentMedia } from "../services";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  type CaregiverDocument,
  type CaregiverDocumentType,
} from "../types";

interface Props {
  caregiverId: string;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function daysUntil(expiry: string): number {
  const [y, m, d] = expiry.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function ExpiryBadge({ expiry }: { expiry: string | null }) {
  if (!expiry) {
    return <span className="text-xs text-muted-foreground">Sem validade</span>;
  }
  const days = daysUntil(expiry);
  if (days < 0) {
    return <Badge variant="destructive">Vencido</Badge>;
  }
  if (days === 0) {
    return <Badge variant="destructive">Vence hoje</Badge>;
  }
  if (days <= 30) {
    return <Badge variant="secondary">Vence em {days}d</Badge>;
  }
  return <Badge variant="outline">Vence em {days}d</Badge>;
}

const EMPTY_FORM = {
  document_type: "other" as CaregiverDocumentType,
  name: "",
  issue_date: "",
  expiry_date: "",
};

export function CaregiverDocumentsCard({ caregiverId }: Props) {
  const { data: documents = [], isLoading } = useCaregiverDocuments(caregiverId);
  const createDocument = useCreateCaregiverDocument(caregiverId);
  const deleteDocument = useDeleteCaregiverDocument(caregiverId);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [docToDelete, setDocToDelete] = useState<CaregiverDocument | null>(null);

  function resetForm() {
    setForm(EMPTY_FORM);
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome do documento");
      return;
    }

    setSubmitting(true);
    try {
      let mediaId: string | null = null;
      if (file) {
        mediaId = await uploadDocumentMedia(file);
      }

      await createDocument.mutateAsync({
        caregiver_id: caregiverId,
        document_type: form.document_type,
        name: form.name.trim(),
        media_id: mediaId,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
      });

      toast.success("Documento adicionado");
      setCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar documento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!docToDelete) return;
    try {
      await deleteDocument.mutateAsync(docToDelete.id);
      toast.success("Documento removido");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover documento");
    } finally {
      setDocToDelete(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Registros profissionais, certidões, exames e demais documentos do cuidador.
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p className="text-sm">Nenhum documento cadastrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="text-muted-foreground">
                    {doc.document_type_display ||
                      DOCUMENT_TYPE_LABELS[doc.document_type] ||
                      doc.document_type}
                  </TableCell>
                  <TableCell className="font-medium">
                    {doc.media_url ? (
                      <a
                        href={doc.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {doc.name}
                      </a>
                    ) : (
                      doc.name
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.issue_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.expiry_date)}
                  </TableCell>
                  <TableCell>
                    <ExpiryBadge expiry={doc.expiry_date} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDocToDelete(doc)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Novo documento</DialogTitle>
            <DialogDescription>
              Cadastre um documento do cuidador. Anexe o arquivo se desejar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select
                value={form.document_type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    document_type: (v ?? "other") as CaregiverDocumentType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: string | null) =>
                      DOCUMENT_TYPE_LABELS[(v ?? "other") as CaregiverDocumentType] ?? "Selecione"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-name">Nome *</Label>
              <Input
                id="doc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex.: COREN-SP 123456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="doc-issue">Emissão</Label>
                <Input
                  id="doc-issue"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-expiry">Vencimento</Label>
                <Input
                  id="doc-expiry"
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-file">Arquivo (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="doc-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {file && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="h-3 w-3" />
                  {file.name}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={docToDelete !== null}
        onOpenChange={(open) => !open && setDocToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{docToDelete?.name}&quot;? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDocument.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteDocument.isPending}>
              {deleteDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
