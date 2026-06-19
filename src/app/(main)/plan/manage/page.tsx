import { redirect } from "next/navigation"
import { getMyClinicPlan, manageGetClinic } from "../actions"
import { ManageSubscriptionClient } from "./manage-client"

export default async function ManageSubscriptionPage() {
  const [clinicPlanInfo, clinic] = await Promise.all([
    getMyClinicPlan(),
    manageGetClinic(),
  ])

  if (!clinic) {
    redirect("/plan")
  }

  return (
    <ManageSubscriptionClient
      clinicName={clinic.name}
      hasStripeCustomer={!!clinic.stripe_customer_id}
      currentStatus={clinicPlanInfo?.clinicPlan?.status ?? null}
    />
  )
}
