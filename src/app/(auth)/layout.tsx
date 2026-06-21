import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ze_access")?.value;

  if (accessToken) {
    const payload = decodeJwt(accessToken);
    if (payload && !isTokenExpired(payload) && payload.role === "clinic_admin") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}
