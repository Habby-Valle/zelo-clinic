import { NextRequest, NextResponse } from "next/server";
import { getMeApi } from "@/features/auth";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("ze_access")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const data = await getMeApi(accessToken);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
}
