import { FileText } from "lucide-react";
import type { PatientDocument } from "../types";

interface PatientDocumentsProps {
  documents: PatientDocument[];
}

export function PatientDocuments({ documents }: PatientDocumentsProps) {
  if (documents.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {documents.map((doc) => {
        const isImage = doc.mime_type?.startsWith("image/");
        return (
          <a
            key={doc.id}
            href={doc.media_url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            title={doc.original_filename}
            className="group flex w-28 flex-col overflow-hidden rounded-md border transition-colors hover:border-primary"
          >
            {isImage && doc.media_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.media_url}
                alt={doc.original_filename}
                className="h-24 w-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-full items-center justify-center bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <span className="truncate px-2 py-1 text-xs text-muted-foreground group-hover:text-foreground">
              {doc.original_filename}
            </span>
          </a>
        );
      })}
    </div>
  );
}
