import { apiFetchClient } from "@/lib/api-client";

export interface AsaasConfig {
  api_key: string;
  wallet_id: string;
  is_active: boolean;
  has_api_key?: boolean;
}

export async function getAsaasConfig(): Promise<AsaasConfig> {
  return apiFetchClient<AsaasConfig>("/asaas/config/me/");
}

export interface UpdateAsaasConfigData {
  api_key?: string;
  wallet_id?: string;
}

export async function updateAsaasConfig(data: UpdateAsaasConfigData): Promise<AsaasConfig> {
  return apiFetchClient<AsaasConfig>("/asaas/config/me/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function testAsaasConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
  return apiFetchClient<{ success: boolean; message: string }>("/asaas/config/test/", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey }),
  });
}
