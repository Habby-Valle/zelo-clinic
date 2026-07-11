"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, MoreHorizontal, Pencil, Plus, Trash2, Eye, Copy } from "lucide-react";
import { toast } from "sonner";

import {
  useChecklists,
  useDeleteChecklist,
  useDuplicateChecklist,
} from "@/features/checklists/hooks";
import { useChecklist } from "@/features/checklists/hooks";
import type { Checklist, ChecklistDetail } from "@/features/checklists/types";
import { ChecklistDialog } from "./checklist-dialog";
import { MaterialIcon } from "@/components/shared/material-icon";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function EditChecklistDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: checklist } = useChecklist(id);
  return (
    <ChecklistDialog
      open={open}
      onOpenChange={onOpenChange}
      checklist={checklist as ChecklistDetail | undefined}
    />
  );
}

export function ChecklistsPageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useChecklists({
    search,
    isActive: isActive === "all" ? "" : isActive,
    page,
    pageSize,
  });
  const deleteChecklist = useDeleteChecklist();
  const duplicateChecklist = useDuplicateChecklist();

  const checklists = data?.checklists ?? [];
  const total = data?.total ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Checklist | null>(null);

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(cl: Checklist) {
    setEditingId(cl.id);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ListChecks className="h-6 w-6" />
            Checklists
          </h1>
          <p className="mt-1 text-muted-foreground">Protocolos de cuidado e tarefas da clínica.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Checklist
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={isActive}
          onValueChange={(v) => {
            setIsActive(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(v: string | null) => {
                const labels: Record<string, string> = {
                  all: "Todos",
                  true: "Ativos",
                  false: "Inativos",
                };
                return labels[v ?? ""] ?? v;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : checklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ListChecks className="h-8 w-8" />
                    <p>Nenhum checklist encontrado</p>
                    <Button variant="outline" size="sm" onClick={openCreate}>
                      Criar primeiro checklist
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              checklists.map((cl) => {
                const isGlobal = cl.clinic_id === null;
                return (
                  <TableRow
                    key={cl.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/checklists/${cl.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cl.icon ? (
                          <MaterialIcon name={cl.icon} size="sm" />
                        ) : (
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                        )}
                        {cl.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isGlobal ? "default" : "secondary"}>
                        {isGlobal ? "Global" : "Da clínica"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cl.items_count}</TableCell>
                    <TableCell>
                      <Badge variant={cl.is_active ? "secondary" : "outline"}>
                        {cl.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/checklists/${cl.id}`);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {!isGlobal ? (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(cl);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(cl);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateChecklist.mutate(cl.id, {
                                  onSuccess: () =>
                                    toast.success("Checklist duplicado para a clínica"),
                                  onError: () => toast.error("Erro ao duplicar checklist"),
                                });
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar para clínica
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        label="checklists"
      />

      {editingId === null && <ChecklistDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
      {editingId !== null && (
        <EditChecklistDialog
          id={editingId}
          open={dialogOpen}
          onOpenChange={(v) => {
            setDialogOpen(v);
            if (!v) setEditingId(null);
          }}
        />
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklist?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteChecklist.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteChecklist.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success("Checklist excluído");
                    setDeleteTarget(null);
                  },
                  onError: () => toast.error("Erro ao excluir checklist"),
                });
              }}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deleteChecklist.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
