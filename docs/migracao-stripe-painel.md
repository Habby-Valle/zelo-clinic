# Migração do painel da clínica para o Stripe

Plano da ponta web. O lado do backend está em
`zelo-api/docs/migracao-stripe-clinica.md`, e as decisões de escopo já tomadas
lá valem aqui: **só cartão, só mensal, assinaturas ativas recriadas**.

---

## O que existe hoje

Tudo vive em `src/app/(main)/plan/` — 1621 linhas em 5 arquivos:

| Arquivo | Linhas | Papel |
|---|---:|---|
| `plan-client.tsx` | 845 | vitrine de planos, modal de pagamento, PIX, troca, cancelamento |
| `actions.ts` | 296 | server actions falando com a API |
| `manage/manage-client.tsx` | 389 | detalhes da assinatura, histórico, PIX por cobrança |
| `page.tsx` | 70 | composição + skeleton |
| `manage/page.tsx` | 21 | idem |

Asaas aparece em 12 pontos, nos três primeiros.

---

## A descoberta que define o desenho

**O fluxo de cartão já é redirect para checkout hospedado.** Em
`plan-client.tsx:494`:

```ts
if (result.billingType === "CREDIT_CARD" && result.checkoutUrl) {
  window.location.href = result.checkoutUrl;
```

E a volta **já é tratada** (`plan-client.tsx:392-410`): a página lê
`?success=true` / `?canceled=true`, invalida a query e mostra o toast.

Ou seja, a forma que o Stripe Checkout precisa já está construída. Trocar o
gateway aqui é trocar de onde vem a URL — não redesenhar o fluxo.

---

## Decisão de desenho: Checkout hospedado + Billing Portal

**Recomendação: Stripe Checkout (redirect), não Payment Element (embutido).**

Por quê:

1. **Encaixa no que já existe** — o redirect e a volta estão prontos.
2. **Zero dependência nova.** O `CLAUDE.md` do projeto pede alinhamento
   explícito para sair da stack; o Payment Element traria `@stripe/stripe-js`
   e `@stripe/react-stripe-js`, além de um formulário de cartão nosso.
3. **A regra nº 1 da família cai de graça**: acesso só nasce de webhook
   confirmado. A volta do checkout só dá `router.refresh()`; quem ativa é o
   webhook.
4. **Superfície de PCI zero** — o cartão nunca passa pelo nosso domínio.

O que se perde: alguns segundos fora da nossa marca, e menos controle visual.
Para um painel B2B que a clínica usa uma vez por mês, é troca barata.

**E o Billing Portal resolve a troca de cartão.** No app, isso custou uma tela
inteira (`payment-method-card.tsx`) porque não existe portal dentro de um sheet
nativo. Na web é uma URL.

### O que liberar no Portal — e o que não

Liberar: **atualizar cartão** e **ver faturas**.

**Não liberar cancelamento nem troca de plano.** Não é preciosismo: a família
ensinou que cancelamento com `cancel_at_period_end` **mantém o status
`active`**, então o webhook de `canceled` não dispara e o e-mail nunca sai —
por isso o e-mail de cancelamento é enviado pela própria view, no ato. Se a
clínica cancelar dentro do Portal, essa view não roda. Ou tratamos
`customer.subscription.updated` com `cancel_at_period_end=true`, ou mantemos
cancelamento e troca no nosso lado, onde já temos a cópia, o e-mail e as regras
de proporcionalidade.

Mantemos no nosso lado.

---

## O que encolhe

Sai tudo que é PIX — decisão de escopo já tomada:

- modal de escolha PIX × cartão (`plan-client.tsx:711-756`) → vai direto ao checkout
- QR, copia-e-cola e polling de confirmação (`plan-client.tsx:412-441, 610-710`)
- aviso de valor proporcional do upgrade no QR
- `getPlanPaymentPix()` e o modal de PIX por cobrança em `manage-client.tsx`

São ~200 linhas em `plan-client.tsx` e ~120 em `manage-client.tsx`.

E some o aviso mais constrangedor do painel (`manage-client.tsx:229-235`):

> "Para mudar entre PIX e cartão, cancele a assinatura atual e assine novamente"

O Portal responde isso.

---

## O que muda, por arquivo

### `actions.ts`

| Hoje | Vira |
|---|---|
| `asaasSubscribe(planId, billingType, cycle)` | `createCheckoutSession(planId)` → `{ checkoutUrl }` |
| `cancelSubscription()` → `/asaas/plans/cancel/` | mesma assinatura, rota `/stripe/clinic/cancel/` |
| `manageGetClinic()` → `/asaas/plans/me/` | `/stripe/clinic/me/` |
| `getPlanPaymentPix()` | **remover** |
| — | `createPortalSession()` → `{ portalUrl }` |
| `requestPlanChange()` | ver dívida nº 2 |

### `plan-client.tsx`

- `handlePaymentChoice` deixa de existir; `handleSubscribe` leva direto ao checkout
- o diálogo de confirmação de troca fica, com a cópia nova: no cartão o Stripe
  faz proporcionalidade nativa (`create_prorations`), não há PIX de diferença
- `subscribeResult` perde `pixQrCode`, `pixPayload`, `prorataValue`

### `manage/manage-client.tsx`

- cabeçalho deixa de dizer "Assinatura ASAAS"
- `asaas_subscription_id` → `gateway_subscription_id` (ou some da tela: id de
  gateway não diz nada para a clínica)
- histórico continua **nosso**, lido de `StripeInvoice` — não do Portal
- botão "Atualizar forma de pagamento" abre o Portal

---

## Contrato com o backend

Endpoints que o painel vai precisar, e que ainda não existem:

```
POST /stripe/clinic/subscribe/   → { checkout_url }
GET  /stripe/clinic/me/          → assinatura + faturas
POST /stripe/clinic/cancel/      → cancel_at_period_end
POST /stripe/clinic/portal/      → { portal_url }
```

O `portal/` é novo até para o backend — a família não precisou dele. É uma
chamada só (`stripe.billing_portal.Session.create`), mas não está lá.

**Renomeação combinada:** `ClinicPlanSerializer` expõe `asaas_status` e
`asaas_subscription_id`. Viram `gateway_status` e `gateway_subscription_id` —
quebra o front de propósito, então as duas pontas no mesmo PR.

**Pré-requisito:** nenhum plano de clínica tem `stripe_price_id` hoje (os 6
ativos estão todos sem). O `sync_stripe_prices` precisa rodar para o escopo
`clinic` antes de qualquer teste de ponta a ponta.

---

## Pergunta em aberto: o trial da clínica é outro modelo

Isto não é detalhe de implementação, é decisão de produto.

| | Família | Clínica |
|---|---|---|
| Como o trial existe | `trial_days=7` **no plano pago** | um `Plan` separado, "Trial", R$ 0 |
| Fim do trial | vira cobrança sozinho | expira, e a clínica escolhe um plano do zero |
| Cartão | exigido na entrada | nenhum |

O modelo da clínica **não tem equivalente no Stripe**: assinar um plano de R$ 0
não é uma assinatura com trial, e sem cartão não há conversão automática — é
exatamente o desenho de que a família saiu.

Três saídas:

1. **Espelhar a família** — `trial_days` nos planos pagos, cartão na entrada,
   conversão automática. Melhor conversão, mais atrito na porta.
2. **Manter o plano Trial fora do Stripe** — continua sendo ativação local, sem
   gateway. Simples, mas mantém o beco: o trial acaba e ninguém vira cliente
   sem repetir tudo.
3. **Tirar o trial da clínica** nesta fase.

Enquanto não for decidido, o card "Trial" na vitrine fica sem destino no fluxo
novo.

---

## Dívidas que a migração encosta

Nenhuma precisa ser paga agora, mas todas ficam mais baratas com o arquivo já
aberto:

1. **`actions.ts` chama a API direto.** O `CLAUDE.md` do projeto diz que só
   `features/*/services/` fala com o Django. A migração reescreve quase todo o
   arquivo — é a hora barata de mover para `features/plan/services/`.
2. **`requestPlanChange()` é um no-op para plano pago.** Busca a lista de
   planos, acha o alvo, e retorna `{ success: true }` sem fazer nada
   (`actions.ts:174`). Uma ida ao servidor por clique, sem efeito. Some sozinho
   no fluxo novo.
3. **`activate-free` é código morto.** O plano "Gratuito" está
   `is_active=False` no banco — a clínica nasce sem plano. O ramo
   `monthly_price === 0` só alcança o Trial, que vai por `activate-trial`.
4. **`loadingPlanId` nunca muda.** `const [loadingPlanId] = useState(null)` —
   sem setter (`plan-client.tsx:362`). O spinner "Redirecionando..." do card
   nunca aparece. Com o redirect do Checkout, o feedback importa mais.
5. **`yearly_price`** continua no tipo `Plan` e no normalizador, sem uso — a
   decisão é só mensal.

---

## Ordem sugerida

1. Backend: endpoints `/stripe/clinic/*` + `sync_stripe_prices` no escopo clinic
2. Decidir o trial (pergunta acima) — muda a vitrine
3. `actions.ts`: novas actions, remover PIX, mover para `features/plan/services/`
4. `plan-client.tsx`: checkout direto, cópia de proporcionalidade no cartão
5. `manage-client.tsx`: Portal + histórico do `StripeInvoice`
6. Renomear `asaas_*` → `gateway_*` nas duas pontas, mesmo PR
7. Roteiro de testes espelhando o da família — inclusive ler a caixa de e-mail
   a cada passo, que foi onde a família achou 10 dos 26 defeitos

---

_Levantado em 14/08/2026, branch `feat/stripe-migration-clinic`._
