import { Suspense } from "react"
import { VerifyOtpForm } from "@/features/auth/components"

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  )
}
