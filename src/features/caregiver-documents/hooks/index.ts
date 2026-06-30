import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCaregiverDocument,
  deleteCaregiverDocument,
  fetchCaregiverDocuments,
} from "../services";
import type { CreateCaregiverDocumentInput } from "../types";

const documentsKey = (caregiverId: string) => ["caregiver-documents", caregiverId] as const;

export function useCaregiverDocuments(caregiverId: string) {
  return useQuery({
    queryKey: documentsKey(caregiverId),
    queryFn: () => fetchCaregiverDocuments(caregiverId),
    enabled: Boolean(caregiverId),
  });
}

export function useCreateCaregiverDocument(caregiverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCaregiverDocumentInput) => createCaregiverDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(caregiverId) });
    },
  });
}

export function useDeleteCaregiverDocument(caregiverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCaregiverDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(caregiverId) });
    },
  });
}
