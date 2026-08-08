import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "@/lib/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Grava/atualiza o cookie httpOnly ze_access numa resposta. */
function setAccessCookie(response: NextResponse, access: string) {
  const payload = decodeJwt(access);
  const now = Math.floor(Date.now() / 1000);
  const maxAge = payload ? payload.exp - now : 60 * 60 * 24;
  response.cookies.set("ze_access", access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

/** Troca o refresh token por um novo access token (chama o Django direto). */
async function tryRefreshAccess(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access: string };
    return data.access || null;
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const trailingSlash = request.nextUrl.pathname.endsWith("/") ? "/" : "";
  const pathname = "/" + path.join("/") + trailingSlash;
  const search = request.nextUrl.search;
  const url = `${API_URL}${pathname}${search}`;

  const contentType = request.headers.get("content-type");
  const isFormData = contentType?.includes("multipart/form-data");
  const headers: Record<string, string> = {};

  const token = request.cookies.get("ze_access")?.value;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (contentType && !isFormData) {
    headers["Content-Type"] = contentType;
  }

  const body = isFormData ? await request.formData() : await request.text().catch(() => undefined);

  const buildResponse = (res: Response) => {
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(key)) {
        responseHeaders[key] = value;
      }
    });
    return { res, responseHeaders };
  };

  try {
    let { res, responseHeaders } = buildResponse(
      await fetch(url, { method: request.method, headers, body: body || undefined })
    );

    // 401: token de acesso expirado → renova com o refresh e repete a chamada.
    if (res.status === 401) {
      const refreshToken = request.cookies.get("ze_refresh")?.value;
      const newAccess = refreshToken ? await tryRefreshAccess(refreshToken) : null;
      if (newAccess) {
        headers["Authorization"] = `Bearer ${newAccess}`;
        const retry = await fetch(url, {
          method: request.method,
          headers,
          body: body || undefined,
        });
        if (retry.status !== 401) {
          const built = buildResponse(retry);
          res = built.res;
          responseHeaders = built.responseHeaders;
          const response = new NextResponse(retry.status === 204 ? null : await retry.text(), {
            status: retry.status,
            headers: responseHeaders,
          });
          setAccessCookie(response, newAccess);
          return response;
        }
      }
    }

    const isBinary = res.headers.get("content-type") === "application/pdf";
    const responseBody =
      res.status === 204 ? null : isBinary ? await res.arrayBuffer() : await res.text();

    return new NextResponse(responseBody, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do proxy";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
