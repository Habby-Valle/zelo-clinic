"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoiceById,
  updateInvoiceStatus,
  fetchInvoiceStats,
} from "../services";

export function useInvoices(params: { status: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["invoices", params.status, params.page, params.pageSize],
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => fetchInvoiceById(id),
    enabled: !!id,
  });
}

export function useUpdateInvoiceStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "paid" | "cancelled") => updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-stats"] });
    },
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoice-stats"],
    queryFn: fetchInvoiceStats,
  });
}
