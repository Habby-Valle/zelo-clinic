import { Suspense } from "react";
import { MessageSquare } from "lucide-react";
import { FeedbackFormClient, FeedbackListClient } from "@/features/feedback";
import { FeedbackGuard } from "@/features/feedback/components/feedback-guard";

export const metadata = { title: "Feedback — Zelo Clinic" };

export default function FeedbackPage() {
  return (
    <FeedbackGuard>
      <div className="space-y-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquare className="h-6 w-6" />
            Enviar Feedback
          </h1>
          <p className="mt-1 text-muted-foreground">
            Compartilhe sugestões, reporte bugs ou envie elogios para a equipe Zelo.
          </p>
        </div>

        <Suspense>
          <FeedbackFormClient />
        </Suspense>

        <div className="border-t pt-8">
          <Suspense>
            <FeedbackListClient />
          </Suspense>
        </div>
      </div>
    </FeedbackGuard>
  );
}
