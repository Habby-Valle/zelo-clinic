"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChecklists,
  fetchChecklist,
  createChecklistFetch,
  updateChecklistFetch,
  deleteChecklistFetch,
  duplicateChecklistFetch,
} from "@/features/checklists/services";
import type { ChecklistFilters } from "@/features/checklists/types";

export function useChecklists(params?: ChecklistFilters) {
  return useQuery({
    queryKey: ["checklists", "list", params ?? {}],
    queryFn: () => fetchChecklists(params),
  });
}

export function useChecklist(id: string) {
  return useQuery({
    queryKey: ["checklists", "detail", id],
    queryFn: () => fetchChecklist(id),
    enabled: !!id,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createChecklistFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", "list"] });
    },
  });
}

export function useUpdateChecklist(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateChecklistFetch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", "list"] });
      queryClient.invalidateQueries({ queryKey: ["checklists", "detail", id] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChecklistFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", "list"] });
    },
  });
}

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateChecklistFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", "list"] });
    },
  });
}
