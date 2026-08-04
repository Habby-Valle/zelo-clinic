import { extractApiErrorMessage } from "@/lib/api-error";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetchClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiClientError(res.status, extractApiErrorMessage(body));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
