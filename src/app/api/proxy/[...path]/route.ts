import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const trailingSlash = request.nextUrl.pathname.endsWith("/") ? "/" : "";
  const pathname = "/" + path.join("/") + trailingSlash;
  const search = request.nextUrl.search;
  const url = `${API_URL}${pathname}${search}`;

  const token = request.cookies.get("ze_access")?.value;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const contentType = request.headers.get("content-type");
  const isFormData = contentType?.includes("multipart/form-data");
  if (contentType && !isFormData) {
    headers["Content-Type"] = contentType;
  }

  const body = isFormData ? await request.formData() : await request.text().catch(() => undefined);

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(key)) {
        responseHeaders[key] = value;
      }
    });

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
