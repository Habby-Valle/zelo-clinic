# Zelo Clinic — Guia do Cliente

Este documento apresenta, em linguagem simples, o que é o **Zelo Clinic** e o que cada
área do painel faz. Serve como material de apresentação para a clínica entender, sem
termos técnicos, como o sistema apoia a gestão do cuidado no dia a dia.

---

## O que é o Zelo Clinic?

O **Zelo** é uma plataforma que organiza e protege o cuidado de idosos, conectando
**famílias**, **cuidadores** e **clínicas**. O **Zelo Clinic** é o **painel web da
clínica** — a central de gestão onde a instituição administra pacientes, equipe,
contratos, turnos e emergências.

Enquanto o **aplicativo** é usado por famílias e cuidadores no dia a dia, o **painel
web** é o cérebro da operação da clínica: é aqui que as solicitações das famílias são
recebidas, os planos de cuidado são montados e a equipe é organizada.

### Quem usa o painel

O painel tem dois perfis internos, cada um com o seu escopo:

| Perfil | Quem é | O que faz no painel |
| ------ | ------ | ------------------- |
| **Admin da Clínica** | Administrador da instituição | Gestão completa: contratos, faturas, equipe, turnos, SOS, relatórios e configurações |
| **Enfermeiro(a)** | Responsável clínico (ex.: COREN) | Monta e aprova os **planos de cuidado** e os **checklists** dos pacientes |

> Algumas áreas são exclusivas de um perfil. Por exemplo, os **Planos de Cuidado** são
> montados pelo enfermeiro(a); a parte comercial e administrativa fica com o Admin.

---

## Como a clínica se encaixa no fluxo

```
FAMÍLIA (app)                        CLÍNICA (painel web)
─────────────                        ────────────────────
1. Solicita o cuidado ─────────────►  Recebe a solicitação em CONTRATOS
2. Declara a saúde do idoso ───────►  Valida os dados de saúde
                                  ◄──  3. Envia a proposta (valor por hora/turno)
4. Aceita a proposta ──────────────►  Contrato fica ATIVO
                                       │
                                       ▼
                          5. Enfermeiro(a) monta o PLANO DE CUIDADO
                             (checklists + metas + cuidador responsável)
                                       │
                                       ▼
                          6. Admin agenda os TURNOS → cuidador executa (app)
                                       │
                                       ▼
                          7. Acompanha horas, relatórios, faturas e SOS
```

---

## As áreas do painel (menu lateral)

A seguir, cada item do menu e o que ele faz.

### 📊 Dashboard
A tela de abertura, com a visão geral da clínica.
- Indicadores rápidos: pacientes, clientes, cuidadores, turnos de hoje, pendências,
  checklists do dia, SOS ativos e índice de satisfação.
- Atalhos para as ações mais usadas (gerenciar equipe, turnos, checklists).
- Aviso imediato quando há uma emergência ativa.

### 📄 Contratos
O coração da entrada de novos atendimentos.
- Recebe as **solicitações de cuidado** enviadas pelas famílias.
- Permite **validar a declaração de saúde** feita pela família (medicações,
  alergias, condições, receita anexada).
- **Envio da proposta comercial** (valor por hora e por turno).
- Acompanhamento do status: solicitado → proposta enviada → ativo → suspenso/cancelado.

### 🧾 Faturas
A gestão financeira dos contratos.
- Faturas geradas para cada contrato.
- Acompanhamento de pagamentos.
- Detalhe de cada fatura.
- Os pagamentos das famílias entram por **PIX via Asaas** e são conciliados
  automaticamente (ver a seção **Pagamentos com o Asaas** abaixo).

### 💗 Planos de Cuidado  *(Enfermeiro(a))*
Onde o responsável clínico define **como** cada paciente será cuidado.
- Associa os **checklists** aplicáveis a cada paciente.
- Define **metas do plano** (métrica alvo) e a **criticalidade** do caso.
- Indica o **cuidador responsável**.
- Fluxo de revisão: o plano pode ser **devolvido** para ajustes ou **aprovado**.

### 🧑‍⚕️ Pacientes
O cadastro completo dos idosos atendidos.
- Lista de pacientes da clínica.
- Prontuário com condições, alergias e medicações.
- Histórico consolidado do cuidado.

### 👨‍👩‍👧 Clientes
Os familiares vinculados à clínica.
- Lista dos familiares (quem contrata e acompanha).
- Dados de contato e vínculos com os pacientes.

### 👥 Equipe
A gestão dos profissionais da clínica.
- Cadastro de **cuidadores** e **enfermeiros(as)**.
- **Convite de enfermeiro(a)** por e-mail.
- **Aprovação dos documentos** enviados pelos cuidadores (o cuidador só pode atuar
  após aprovação).

### 📅 Turnos
A escala de trabalho.
- Criação e visualização dos turnos (plantões).
- Turnos avulsos e recorrentes.
- Ao criar o turno, os checklists do plano ativo são carregados automaticamente.
- Acompanhamento do status de cada plantão.

### 📋 Checklists
Os protocolos de cuidado que a equipe deve seguir.
- Criação e edição de checklists (medicação, higiene, alimentação, etc.).
- Itens do checklist com **instruções para o cuidador**.
- Vínculo com **medicamentos**.
- Usados dentro dos planos de cuidado e materializados nos turnos.

### 🚨 SOS
O monitoramento de emergências da clínica.
- Recebe em tempo real os alertas disparados pelos cuidadores.
- Permite **resolver** os alertas, registrando motivo e duração.
- Histórico completo das ocorrências.

### ⏱️ Horas
O controle de horas trabalhadas pelos cuidadores.
- Acompanhamento das horas por cuidador.
- Base para conferência e pagamento da equipe.

### 📈 Relatórios
A visão gerencial consolidada.
- Relatórios sobre a operação da clínica.
- Apoio à tomada de decisão.

### 💬 Feedback
As avaliações e retornos recebidos.
- Feedback das famílias sobre os turnos e o serviço.

### 💳 Plano
A **assinatura da clínica na plataforma Zelo**.
- Gestão do plano contratado pela clínica junto à Zelo.
- Cobrança e detalhes da assinatura.

### 📜 Logs de Auditoria
O registro de segurança e rastreabilidade.
- Histórico de todas as ações sensíveis feitas no painel.
- Quem fez o quê e quando — garante transparência e conformidade.

### ⚙️ Configurações
Os ajustes gerais da clínica.
- Dados da instituição e preferências do sistema.

---

## Primeiro acesso — Onboarding

Ao entrar pela primeira vez, a clínica passa por um **fluxo de configuração inicial**
(onboarding) que prepara o ambiente antes do uso: dados da instituição e ajustes
essenciais para começar a operar.

Novos membros (cuidadores, enfermeiros e familiares) entram por **convite** — recebem
um link e concluem o cadastro por ele.

---

## O SOS de emergência, do lado da clínica

O SOS conecta o cuidador em campo à clínica em segundos:

1. O **cuidador** aciona o botão de emergência no aplicativo.
2. O alerta aparece **na hora** no painel da clínica (e notifica a família).
3. A **clínica** (ou o próprio cuidador que abriu) **resolve** o alerta, registrando o
   motivo e o tempo de duração.
4. Tudo fica no **histórico** para consulta futura.

---

## Pagamentos com o Asaas

A Zelo usa o **Asaas** (plataforma de pagamentos) para movimentar dinheiro. Para a
clínica, isso aparece em **dois fluxos diferentes**:

### 1. A clínica recebe das famílias (pelo cuidado)
- No **primeiro uso**, a clínica **conecta a sua própria conta Asaas** ao painel
  (informando a chave de integração nas configurações). Enquanto isso não é feito,
  um aviso lembra: *"Configure o ASAAS para receber pagamentos"*.
- A clínica **emite as faturas** dos contratos.
- A família **paga por PIX** direto no aplicativo.
- O valor cai **direto na conta da clínica** (a Zelo não intermedia esse dinheiro).
- A confirmação é **automática**: quando o PIX é pago, a fatura é marcada como paga
  sem necessidade de comprovante.

### 2. A clínica paga a Zelo (pela assinatura da plataforma)
- Na área **Plano**, a clínica assina um plano da Zelo.
- As formas de pagamento são **PIX, cartão de crédito ou boleto**.
- Os ciclos podem ser **mensal, trimestral ou anual**.
- O plano é **ativado após a confirmação do pagamento**. Em caso de inadimplência,
  o acesso pago é suspenso até a regularização.

> **Resumindo:** o dinheiro do **cuidado** vai da família **para a clínica**; o
> dinheiro da **assinatura** vai da clínica **para a Zelo**. Ambos passam pelo Asaas,
> mas em contas e fluxos separados.

---

## Resumo

O Zelo Clinic é a central de comando da clínica. Com ele, a instituição:
- **Recebe e fecha contratos** — da solicitação da família à proposta e ativação.
- **Define o cuidado** — planos, checklists e metas por paciente (via enfermeiro(a)).
- **Organiza a equipe e a escala** — cuidadores, documentos, turnos e horas.
- **Responde a emergências** — SOS em tempo real.
- **Enxerga o todo** — faturas, relatórios, feedback e auditoria completa.

> O dia a dia da família e do cuidador acontece no **aplicativo** — apresentado em um
> guia separado (`Zelo App`).
</content>
