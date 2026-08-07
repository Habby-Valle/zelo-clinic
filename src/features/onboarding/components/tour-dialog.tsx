"use client";

import {
  LayoutDashboard,
  FileText,
  UserCircle,
  UserCheck,
  Users,
  Calendar,
  ClipboardList,
  AlertTriangle,
  BarChart2,
  HeartPulse,
  CreditCard,
  ScrollText,
  Settings,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTour } from "../hooks/use-tour";
import type { TourStep } from "../types";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  UserCircle,
  UserCheck,
  Users,
  Calendar,
  ClipboardList,
  AlertTriangle,
  BarChart2,
  HeartPulse,
  CreditCard,
  ScrollText,
  Settings,
  Clock,
};

const tourSteps: TourStep[] = [
  {
    id: "dashboard",
    icon: "LayoutDashboard",
    title: "Dashboard",
    description: "A visão geral do dia a dia da sua clínica, em uma tela só.",
    details: [
      "Números do momento: pacientes, famílias, cuidadores, turnos e alertas",
      "Lista dos turnos mais recentes",
      "Atalhos para o que você mais usa",
    ],
  },
  {
    id: "contracts",
    icon: "FileText",
    title: "Contratos",
    description: "Onde ficam os acordos de cuidado entre a clínica e cada família.",
    details: [
      "Acompanhe se o contrato está em rascunho, ativo, pausado ou encerrado",
      "Confira as informações de saúde enviadas pela família",
      "Convide familiares para acompanhar o paciente pelo aplicativo",
    ],
  },
  {
    id: "patients",
    icon: "UserCircle",
    title: "Pacientes",
    description: "As informações de quem recebe o cuidado.",
    details: [
      "Dados pessoais, condições de saúde, alergias e medicamentos",
      "Quanto cuidado a pessoa precisa e que tipo de experiência o cuidador deve ter",
      "Histórico reunido em um só lugar, com opção de salvar em PDF",
    ],
  },
  {
    id: "clients",
    icon: "UserCheck",
    title: "Clientes",
    description: "Os familiares e responsáveis por cada paciente.",
    details: [
      "Ligue familiares ao paciente certo",
      "Guarde contatos para emergências",
      "Defina o que cada pessoa pode ver e fazer",
    ],
  },
  {
    id: "caregivers",
    icon: "Users",
    title: "Cuidadores",
    description: "A equipe que cuida dos pacientes.",
    details: [
      "Cadastro com os documentos de cada profissional",
      "Áreas de experiência e tipos de cuidado que sabe fazer",
      "Confira os documentos e aprove o cuidador para atender",
    ],
  },
  {
    id: "shifts",
    icon: "Calendar",
    title: "Turnos",
    description: "A agenda de trabalho dos cuidadores.",
    details: [
      "Escolha qual cuidador atende cada paciente e quando",
      "Veja como está cada turno e o que já aconteceu",
      "Registro de entrada e saída do cuidador",
    ],
  },
  {
    id: "checklists",
    icon: "ClipboardList",
    title: "Checklists",
    description: "As listas de tarefas que o cuidador segue durante o turno.",
    details: [
      "Monte cada item do jeito que precisar: resposta escrita, sim ou não, ou uma opção da lista",
      "O cuidador marca o que foi feito ao longo do turno",
      "Acompanhe o que foi cumprido e o que ficou pendente",
    ],
  },
  {
    id: "sos",
    icon: "AlertTriangle",
    title: "SOS",
    description: "Os pedidos de socorro que chegam na hora em que acontecem.",
    details: [
      "Veja os alertas que ainda estão abertos",
      "Confirme que viu o alerta e marque quando for resolvido",
      "Consulte tudo o que já aconteceu",
    ],
  },
  {
    id: "caregiver-hours",
    icon: "Clock",
    title: "Horas",
    description: "Quantas horas cada cuidador trabalhou.",
    details: [
      "Total de horas por profissional",
      "Confira e aprove as horas registradas",
      "Baixe os dados para usar em relatórios",
    ],
  },
  {
    id: "reports",
    icon: "BarChart2",
    title: "Relatórios",
    description: "Gráficos que mostram como a clínica está indo.",
    details: [
      "Turnos, tarefas realizadas e crescimento no número de pacientes",
      "Alertas de SOS, desempenho da equipe e satisfação das famílias",
      "Veja o que está sendo cumprido e onde dá para melhorar",
    ],
  },
  {
    id: "care-plans",
    icon: "HeartPulse",
    title: "Planos de Cuidado",
    description: "O que deve ser feito no cuidado de cada paciente.",
    details: [
      "Planos montados pela equipe de enfermagem",
      "Revise e aprove antes de entrar em uso",
      "Veja as versões anteriores e o que mudou",
    ],
  },
  {
    id: "plan",
    icon: "CreditCard",
    title: "Plano",
    description: "A assinatura da sua clínica na Zelo.",
    details: [
      "Seu plano atual e até quanto ele permite usar",
      "Troque para um plano maior ou menor quando quiser",
      "Todos os pagamentos já feitos",
    ],
  },
  {
    id: "audit",
    icon: "ScrollText",
    title: "Auditoria",
    description: "O histórico de tudo o que foi feito no sistema.",
    details: [
      "Quem fez o quê e quando",
      "Busque por pessoa, tipo de ação ou período",
      "Consulte na tela ou baixe o histórico",
    ],
  },
  {
    id: "settings",
    icon: "Settings",
    title: "Configurações",
    description: "Os dados e preferências da sua clínica.",
    details: [
      "Nome, endereço e logo da clínica",
      "Escolha quais avisos você quer receber",
      "Troque sua senha",
    ],
  },
];

interface TourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TourDialog({ open, onOpenChange }: TourDialogProps) {
  const { currentStep, isFirstStep, isLastStep, next, previous, skip, finish } = useTour(
    tourSteps.length
  );

  const step = tourSteps[currentStep];
  const Icon = iconMap[step?.icon];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  function handleOpenChange(open: boolean) {
    if (!open) {
      skip();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {currentStep + 1} de {tourSteps.length}
              </p>
              <DialogTitle className="text-lg">{step?.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">{step?.description}</p>
          <Separator />
          <ul className="space-y-2">
            {step?.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => {
              skip();
              onOpenChange(false);
            }}
          >
            Pular
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (isFirstStep) {
                  skip();
                  onOpenChange(false);
                } else {
                  previous();
                }
              }}
              disabled={isFirstStep}
            >
              {isFirstStep ? "Cancelar" : "Anterior"}
            </Button>
            {isLastStep ? (
              <Button
                onClick={() => {
                  finish();
                  onOpenChange(false);
                }}
              >
                Concluir
              </Button>
            ) : (
              <Button onClick={next}>Próximo</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
