"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Send,
  Paperclip,
  X,
  Bug,
  Lightbulb,
  Heart,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { useSendFeedback } from "../hooks"

const typeIcons: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Lightbulb,
  compliment: Heart,
  other: MessageSquare,
}

const typeTitles: Record<string, string> = {
  bug: "Reportar Bug",
  feature: "Sugerir Melhoria",
  compliment: "Enviar Elogio",
  other: "Outro Assunto",
}

const typeOptions: Record<string, { label: string; Icon: typeof Bug }> = {
  bug: { label: "Reportar Bug", Icon: Bug },
  feature: { label: "Sugestão de Melhoria", Icon: Lightbulb },
  compliment: { label: "Elogio", Icon: Heart },
  other: { label: "Outro", Icon: MessageSquare },
}

export function FeedbackFormClient() {
  const clinicId = useAuthStore((s) => s.user?.clinic_id ?? null)

  const [type, setType] = useState("bug")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendFeedback = useSendFeedback()

  const TypeIcon = typeIcons[type] ?? MessageSquare

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const valid = selected.filter((f) => f.size <= 10 * 1024 * 1024)
    if (valid.length !== selected.length) {
      toast.error("Alguns arquivos excedem o limite de 10MB e foram ignorados.")
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 5))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (!subject.trim()) {
      toast.error("Preencha o assunto")
      return
    }
    if (!message.trim()) {
      toast.error("Preencha a mensagem")
      return
    }

    sendFeedback.mutate(
      { type, subject: subject.trim(), message: message.trim(), clinicId, files },
      {
        onSuccess: () => {
          toast.success("Feedback enviado com sucesso! Obrigado.")
          setType("bug")
          setSubject("")
          setMessage("")
          setFiles([])
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Erro ao enviar feedback"
          )
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5" />
          {typeTitles[type] ?? "Feedback"}
        </CardTitle>
        <CardDescription>
          Seu feedback será enviado para a equipe Zelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "bug")}>
            <SelectTrigger id="type" className="w-full">
              <SelectValue>
                {(v: string | null) => {
                  const opt = typeOptions[v ?? ""]
                  if (!opt) return "Selecionar tipo"
                  const { label, Icon } = opt
                  return (
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">
                <Bug className="mr-2 inline h-4 w-4" />
                Reportar Bug
              </SelectItem>
              <SelectItem value="feature">
                <Lightbulb className="mr-2 inline h-4 w-4" />
                Sugestão de Melhoria
              </SelectItem>
              <SelectItem value="compliment">
                <Heart className="mr-2 inline h-4 w-4" />
                Elogio
              </SelectItem>
              <SelectItem value="other">
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Outro
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Botão de salvar não funciona"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Descreva detalhadamente o que aconteceu..."
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>Anexos (opcional, até 5 arquivos, máx 10MB cada)</Label>
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                {file.name.length > 30
                  ? file.name.slice(0, 27) + "..."
                  : file.name}
                <button
                  onClick={() => removeFile(i)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {files.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Paperclip className="h-4 w-4" />
                Anexar arquivo
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: PNG, JPG, WebP, GIF
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={sendFeedback.isPending}
          className="gap-2"
        >
          {sendFeedback.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sendFeedback.isPending ? "Enviando..." : "Enviar Feedback"}
        </Button>
      </CardContent>
    </Card>
  )
}
