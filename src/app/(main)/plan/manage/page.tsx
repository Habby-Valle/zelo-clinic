import { redirect } from "next/navigation";
import { getMyClinicPlan, manageGetClinic } from "../actions";
import { ManageSubscriptionClient } from "./manage-client";

export const metadata = { title: "Gerenciar Assinatura — Zelo Clinic" };

export default async function ManageSubscriptionPage() {
  const clinic = await manageGetClinic();

  if (!clinic) {
    redirect("/plan");
  }

  return <ManageSubscriptionClient clinicName={clinic.name} subscription={clinic.subscription} />;
}
