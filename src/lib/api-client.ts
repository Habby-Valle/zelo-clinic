export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

export async function apiFetchClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      body?.non_field_errors?.[0] ??
      body?.detail ??
      body?.error ??
      "Erro desconhecido"
    throw new ApiClientError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
