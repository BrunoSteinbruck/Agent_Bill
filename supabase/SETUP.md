# Configuração do Supabase — passo a passo

Guia para aplicar as migrations e ligar a waitlist. Tudo é feito pelo painel do
Supabase (não precisa de CLI). Faça na ordem.

---

## 1. Descobrir o que já existe

No painel do Supabase → **Table Editor**, veja quais tabelas já aparecem:

- Se **não** existir nenhuma tabela (`profiles`, `cards`, `wallets`, etc.) →
  você está começando do zero: rode a migration **0001**, depois **0002**,
  depois **0003** (seções 2, 3 e 4 abaixo).
- Se as tabelas do produto já existirem mas **não** houver `waitlist` → só
  falta a **0003** (seção 4). Pule 0001 e 0002.
- Se já existir `waitlist` → confira na seção 5 se ela tem a coluna `source`.

> Importante: rode cada migration **uma única vez**. Rodar 0001/0002 de novo
> dá erro de "type already exists" / "relation already exists" — isso só quer
> dizer que já estava aplicada, não é problema, mas evite.

---

## 2. Migration 0001 — schema inicial (só se as tabelas não existem)

1. Painel do Supabase → menu lateral → **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/migrations/0001_initial_schema.sql` do projeto,
   copie **todo** o conteúdo e cole no editor.
3. Clique **Run**. Deve aparecer "Success. No rows returned".

Isso cria os enums, as tabelas (`profiles`, `wallets`, `cards`,
`subscriptions`, `user_rules`, `transactions`, `agent_decisions`) e ativa o RLS
em cada uma.

---

## 3. Migration 0002 — campos do agente (só se ainda não aplicada)

1. **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migrations/0002_agent_decision_fields.sql`.
3. **Run**.

Adiciona `user_message` e `recommended_action` na tabela `agent_decisions`.

---

## 4. Migration 0003 — waitlist (a novidade desta branch)

1. **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migrations/0003_waitlist.sql`.
3. **Run**.

Isso cria a tabela `waitlist` com:

- colunas: `id, name, email, country, stack, reason, locale, source, status,
  created_at` (e-mail único);
- índices por `status` e por `created_at`;
- **RLS ativado sem nenhuma policy** — de propósito. Isso significa que nem o
  público nem usuários logados conseguem ler/escrever a tabela diretamente. Só
  a **service-role key** (usada pela rota `/api/waitlist` no backend) consegue
  inserir, e só você, pelo painel ou pelo console admin, consegue ler. Ou seja:
  a lista de e-mails nunca fica exposta no navegador.

---

## 4b. Migration 0004 — um cartão/carteira por usuário

1. **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/migrations/0004_one_wallet_one_card_per_user.sql`.
3. **Run**.

Adiciona `unique (user_id)` em `wallets` e `cards`. Isso garante **exatamente uma
carteira e um cartão por usuário** — se dois logins simultâneos tentarem
provisionar ao mesmo tempo, o banco barra o segundo (o código relê a linha que
ganhou). Sem isso, linhas duplicadas quebrariam o dashboard.

> Como ainda não há cartões/carteiras criados (o provisionamento depende das
> chaves do Lithic/Crossmint), essa migration aplica sem conflito.

---

## 5. Conferir se deu certo

No **Table Editor**, abra a tabela `waitlist` e confirme:

- as colunas existem, **incluindo `source`**;
- no cabeçalho da tabela aparece o cadeado de **RLS enabled**.

Se a tabela já existia de antes **sem** a coluna `source`, rode só isto no SQL
Editor para adicionar:

```sql
alter table waitlist add column if not exists source text;
```

---

## 6. Variáveis de ambiente

No deploy (Vercel/onde estiver) e no seu `.env.local`, garanta:

| Variável | Para quê | Obrigatória? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | conexão Supabase | sim (já existia) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | conexão Supabase | sim (já existia) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend grava waitlist / lê admin | sim (já existia) |
| `ADMIN_EMAILS` | quem entra no `/admin` (vírgula separa) | **sim, nova** |
| `RESEND_API_KEY` | enviar os e-mails de convite | opcional |
| `WAITLIST_FROM_EMAIL` | remetente do convite | opcional |

- **`ADMIN_EMAILS`**: coloque o seu e-mail (o mesmo da sua conta no app). Ex.:
  `ADMIN_EMAILS=voce@exemplo.com`. Sem isso, o `/admin/waitlist` responde 404
  para todo mundo.
- **`RESEND_API_KEY`** (opcional): sem ela, o console admin funciona normal e os
  status mudam (pending → invited → rejected), só **não dispara e-mail**. Você
  pode liberar geral e mandar o link de cadastro na mão. Quando quiser o envio
  automático, crie uma conta em https://resend.com, gere a API key e cole aqui.
- **`WAITLIST_FROM_EMAIL`** (opcional): por padrão usa o remetente sandbox do
  Resend (`Bill <onboarding@resend.dev>`), que já funciona para teste. Para
  envio de verdade, verifique um domínio no Resend e troque por um endereço dele.

---

## 7. Usar o console da waitlist

1. Crie/entre na sua conta normalmente em `/signup` ou `/login` (com o e-mail
   que está em `ADMIN_EMAILS`).
2. Acesse **`/admin/waitlist`**.
3. Você verá a lista com nome, e-mail, país, stack, origem (source), status e
   data. Para cada pessoa: **Invite** (marca como convidada e, se o Resend
   estiver configurado, manda o e-mail), **Reject** ou **Reset**.
4. Quando quiser abrir para todos de uma vez, use **"Invite all pending"** — ele
   marca todos os pendentes como convidados e dispara os e-mails.

O link do convite leva a pessoa para `/signup` já com o e-mail preenchido. O
status no banco é a fonte da verdade; o e-mail é só um efeito colateral
"melhor-esforço" — se um envio falhar, o status não volta atrás.
