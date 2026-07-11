"use client";

import {
  LayoutDashboard,
  FileText,
  Receipt,
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
  Receipt,
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
    description: "Visão geral da sua clínica com indicadores principais.",
    details: [
      "KPIs: pacientes, clientes, cuidadores, turnos, checklists, SOS, satisfação",
      "Tabela de turnos recentes",
      "Atalhos rápidos para ações frequentes",
    ],
  },
  {
    id: "contracts",
    icon: "FileText",
    title: "Contratos",
    description: "Gerencie contratos de serviço com pacientes.",
    details: [
      "Solicitações e propostas de valores",
      "Ciclo de vida: ativo, suspenso, cancelado",
      "Precificação inteligente com sugestão de valores via IA",
    ],
  },
  {
    id: "billing",
    icon: "Receipt",
    title: "Faturas",
    description: "Controle de faturamento recorrente.",
    details: [
      "Faturas por período com linhas de itens",
      "Horas e valores detalhados",
      "Controle de pagos e pendentes",
    ],
  },
  {
    id: "patients",
    icon: "UserCircle",
    title: "Pacientes",
    description: "Cadastro completo dos pacientes.",
    details: [
      "Dados pessoais, condições de saúde, alergias, medicações",
      "Nível de complexidade e skills necessárias",
      "Prontuário consolidado com exportação em PDF",
    ],
  },
  {
    id: "clients",
    icon: "UserCheck",
    title: "Clientes",
    description: "Familiares e responsáveis pelos pacientes.",
    details: [
      "Vinculação de familiares aos pacientes",
      "Contatos de emergência",
      "Perfil e permissões de acesso",
    ],
  },
  {
    id: "caregivers",
    icon: "Users",
    title: "Cuidadores",
    description: "Gestão de profissionais de cuidado.",
    details: [
      "Cadastro completo com documentos",
      "Especialidades e skills",
      "Verificação e aprovação de documentos",
    ],
  },
  {
    id: "shifts",
    icon: "Calendar",
    title: "Turnos",
    description: "Escala de trabalho dos cuidadores.",
    details: [
      "Atribuição de cuidadores a pacientes",
      "Status e histórico de cada turno",
      "Check-in e check-out",
    ],
  },
  {
    id: "checklists",
    icon: "ClipboardList",
    title: "Checklists",
    description: "Templates de procedimentos de cuidado.",
    details: [
      "Itens configuráveis: texto, booleano, seleção",
      "Execução por turno com registro",
      "Acompanhamento de conformidade",
    ],
  },
  {
    id: "sos",
    icon: "AlertTriangle",
    title: "SOS",
    description: "Alertas de emergência em tempo real.",
    details: [
      "Visualização de alertas ativos",
      "Reconhecimento e resolução",
      "Histórico completo de ocorrências",
    ],
  },
  {
    id: "caregiver-hours",
    icon: "Clock",
    title: "Horas",
    description: "Registro de horas trabalhadas pelos cuidadores.",
    details: [
      "Acompanhamento de horas por profissional",
      "Validação e aprovação",
      "Exportação para relatórios",
    ],
  },
  {
    id: "reports",
    icon: "BarChart2",
    title: "Relatórios",
    description: "Gráficos e estatísticas da clínica.",
    details: [
      "Turnos, checklists, crescimento de pacientes",
      "SOS, cuidadores, satisfação",
      "Conformidade e indicadores de desempenho",
    ],
  },
  {
    id: "care-plans",
    icon: "HeartPulse",
    title: "Planos de Cuidado",
    description: "Revisão e aprovação de planos de cuidado.",
    details: ["Planos elaborados por enfermeiros", "Fluxo de aprovação", "Histórico de versões"],
  },
  {
    id: "plan",
    icon: "CreditCard",
    title: "Plano",
    description: "Assinatura e gestão do plano da clínica.",
    details: ["Plano atual com limites", "Upgrade e downgrade", "Histórico de pagamentos"],
  },
  {
    id: "audit",
    icon: "ScrollText",
    title: "Auditoria",
    description: "Log de todas as ações no sistema.",
    details: [
      "Registro detalhado de operações",
      "Filtros por usuário, ação e data",
      "Consulta e exportação",
    ],
  },
  {
    id: "settings",
    icon: "Settings",
    title: "Configurações",
    description: "Dados e preferências da clínica.",
    details: [
      "Informações da clínica, endereço e logo",
      "Notificações e preferências",
      "Alteração de senha",
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
