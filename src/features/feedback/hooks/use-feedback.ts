"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyFeedbacks, sendFeedbackApi, uploadMediaApi } from "../services";
import type { FeedbackFilters } from "../types";

export function useMyFeedbacks(params: FeedbackFilters) {
  return useQuery({
    queryKey: ["feedbacks", "my", params],
    queryFn: () => fetchMyFeedbacks(params),
  });
}

export function useSendFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: string;
      subject: string;
      message: string;
      clinicId: string | null;
      files: File[];
    }) => {
      const mediaIds: string[] = [];
      for (const file of input.files) {
        const id = await uploadMediaApi(file);
        mediaIds.push(id);
      }
      await sendFeedbackApi({
        type: input.type,
        subject: input.subject,
        message: input.message,
        clinic_id: input.clinicId,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks", "my"] });
    },
  });
}
