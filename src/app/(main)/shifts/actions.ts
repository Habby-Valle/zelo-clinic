"use server";

import { revalidatePath } from "next/cache";
import { requireClinicAdmin } from "@/lib/auth";
import { apiFetchServer } from "@/lib/api";

export async function createShift(data: {
  caregiver_id: string;
  start: string;
  end: string;
  notes?: string;
  patient_id?: string;
}): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  try {
    const { user } = await requireClinicAdmin();

    if (!data.caregiver_id || !data.start || !data.end) {
      return { success: false, error: "Campos obrigatórios não preenchidos" };
    }

    const body: Record<string, unknown> = {
      caregiver_id: data.caregiver_id,
      clinic_id: user.clinic_id,
      start: data.start,
      end: data.end,
      notes: data.notes ?? "",
    };

    if (data.patient_id) {
      body.shift_patients = [{ patient_id: data.patient_id }];
    }

    // Os checklists são gerados pelo backend a partir do plano de cuidado ativo
    // do paciente — não são mais selecionados manualmente por turno.
    const shift = await apiFetchServer<{ id: string; warnings?: string[] }>("/shifts/", {
      method: "POST",
      body: JSON.stringify(body),
    });

    revalidatePath("/shifts");
    return { success: true, warnings: shift.warnings ?? [] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao criar turno",
    };
  }
}

export async function finishShift(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin();
    await apiFetchServer<unknown>(`/shifts/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao finalizar turno",
    };
  }
}

export async function cancelShift(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin();
    await apiFetchServer<unknown>(`/shifts/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });
    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao cancelar turno",
    };
  }
}

export async function deleteShift(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin();
    await apiFetchServer<unknown>(`/shifts/${id}/`, { method: "DELETE" });
    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao excluir turno",
    };
  }
}

export async function createShiftTemplate(data: {
  name: string;
  start_time: string;
  end_time: string;
  instructions?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await requireClinicAdmin();

    if (!data.name.trim() || !data.start_time || !data.end_time) {
      return { success: false, error: "Campos obrigatórios não preenchidos" };
    }

    await apiFetchServer<unknown>("/shift-templates/", {
      method: "POST",
      body: JSON.stringify({
        clinic_id: user.clinic_id,
        name: data.name.trim(),
        start_time: data.start_time,
        end_time: data.end_time,
        instructions: data.instructions ?? "",
      }),
    });

    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao criar template",
    };
  }
}

export async function updateShiftTemplate(data: {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  instructions?: string;
  is_active: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin();

    await apiFetchServer<unknown>(`/shift-templates/${data.id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name.trim(),
        start_time: data.start_time,
        end_time: data.end_time,
        instructions: data.instructions ?? "",
        is_active: data.is_active,
      }),
    });

    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao atualizar template",
    };
  }
}

export async function deleteShiftTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin();
    await apiFetchServer<unknown>(`/shift-templates/${id}/`, {
      method: "DELETE",
    });
    revalidatePath("/shifts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao excluir template",
    };
  }
}
