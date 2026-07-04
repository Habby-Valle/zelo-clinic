import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/jwt";

export default async function Home() {
  const token = (await cookies()).get("ze_access")?.value;
  const role = token ? decodeJwt(token)?.role : null;
  // Enfermeiro não tem dashboard — vai para os planos de cuidado.
  redirect(role === "clinic_nurse" ? "/care-plans" : "/dashboard");
}
