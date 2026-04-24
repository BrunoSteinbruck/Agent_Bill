export type LocaleCode = "en" | "pt";

type SiteCopy = {
  ui: {
    brandDescriptor: string;
    localeLabel: string;
    v1Scope: string;
    updatingLanguage: string;
  };
  navigation: {
    features: string;
    infrastructure: string;
    docs: string;
    apply: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    supportEyebrow: string;
    supportRows: Array<{
      symbol: string;
      merchant: string;
      note: string;
      amount: string;
      time: string;
    }>;
    reviewCount: string;
    reviewEyebrow: string;
    reviewTitle: string;
    reviewDescription: string;
  };
  assistant: {
    kicker: string;
    title: string;
    description: string;
    items: Array<{ title: string; text: string }>;
  };
  scenarios: {
    kicker: string;
    title: string;
    description: string;
    items: Array<{
      tag: string;
      merchant: string;
      amount: string;
      message: string;
      context: string;
      primaryAction: string;
      secondaryAction: string;
    }>;
  };
  how: {
    kicker: string;
    title: string;
    description: string;
    steps: Array<{ number: string; title: string; text: string }>;
  };
  infrastructure: {
    kicker: string;
    title: string;
    description: string;
    bullets: string[];
    panelTitle: string;
    panelCopy: string;
    badges: string[];
    items: Array<{ title: string; text: string }>;
  };
  form: {
    kicker: string;
    title: string;
    description: string;
    fields: {
      name: string;
      email: string;
      country: string;
      stack: string;
      reason: string;
    };
    placeholders: {
      name: string;
      email: string;
      country: string;
      stack: string;
      reason: string;
    };
    submit: string;
    success: string;
    note: string;
    asideTitle: string;
    asideItems: string[];
  };
  footer: {
    summary: string;
    rights: string;
  };
};

export const siteCopy: Record<LocaleCode, SiteCopy> = {
  en: {
    ui: {
      brandDescriptor: "Subscription assistant",
      localeLabel: "Locale selector",
      v1Scope: "V1 scope",
      updatingLanguage: "Updating language...",
    },
    navigation: {
      features: "Features",
      infrastructure: "Infrastructure",
      docs: "Docs",
      apply: "Apply",
    },
    hero: {
      eyebrow: "Calm control for recurring spend",
      title: "A calmer way to manage subscriptions.",
      description:
        "Bill flags quiet price increases, blocks suspicious recurring charges, and asks before billing decisions that deserve your attention.",
      primaryCta: "Apply for access",
      supportEyebrow: "Bill assistant",
      supportRows: [
        {
          symbol: "Z",
          merchant: "Z Cloud",
          note: "Price change detected",
          amount: "$31.00",
          time: "1 min ago",
        },
        {
          symbol: "S",
          merchant: "Streamline",
          note: "Suspicious charge blocked",
          amount: "$89.00",
          time: "3 min ago",
        },
        {
          symbol: "D",
          merchant: "Design Vault",
          note: "9 months active",
          amount: "Review",
          time: "Today",
        },
      ],
      reviewCount: "3",
      reviewEyebrow: "Decision ready",
      reviewTitle: "Review recurring spend with context.",
      reviewDescription: "Price drift, anomalies, and renewals in one calm layer.",
    },
    assistant: {
      kicker: "Features",
      title: "Less monitoring. Better decisions at the moments that matter.",
      description:
        "Bill is not another dashboard asking for constant attention. It is a subscription assistant that stays quiet until recurring spend changes, drifts, or stops making sense.",
      items: [
        {
          title: "Catch quiet price increases",
          text: "Spot changes before they settle quietly into your monthly spend.",
        },
        {
          title: "Review old subscriptions",
          text: "Prompt for a decision when you have been paying for too long on autopilot.",
        },
        {
          title: "Flag abnormal recurring charges",
          text: "Block or review the charges that no longer fit the merchant or your pattern.",
        },
      ],
    },
    scenarios: {
      kicker: "Scenarios",
      title: "Concrete decisions, presented with calm instead of noise.",
      description:
        "Bill turns recurring spend into a short list of high-signal moments: what changed, why it matters, and what you can do next.",
      items: [
        {
          tag: "Price change detected",
          merchant: "Z Cloud",
          amount: "$24 -> $31",
          message:
            "Your plan increased above the range you usually approve for this merchant.",
          context: "Merchant trust is strong. Amount drift is not.",
          primaryAction: "Approve price",
          secondaryAction: "Keep current rule",
        },
        {
          tag: "Blocked as unusual",
          merchant: "Streamline Media",
          amount: "$89 attempt",
          message:
            "We blocked a recurring charge attempt that does not match your history for this merchant.",
          context: "Descriptor changed. Amount is outside your historical band.",
          primaryAction: "Keep blocked",
          secondaryAction: "Allow once",
        },
        {
          tag: "Time to review",
          merchant: "Design Vault",
          amount: "$19 / month",
          message:
            "You have been paying for this subscription for 9 months. Keep it or cancel at renewal?",
          context: "No recent approval prompt. Ongoing spend without a fresh decision.",
          primaryAction: "Keep for 30 days",
          secondaryAction: "Cancel at renewal",
        },
      ],
    },
    how: {
      kicker: "How it works",
      title: "Bill reviews recurring payments in three clear layers.",
      description:
        "The system stays quiet for normal behavior and only asks for attention when a merchant, amount, or pattern moves outside expectations.",
      steps: [
        {
          number: "01",
          title: "Detect billing patterns",
          text: "Recognize recurring merchants, descriptor patterns, amount bands, and renewal cadence.",
        },
        {
          number: "02",
          title: "Evaluate trust and drift",
          text: "Compare the charge against merchant history, your rules, and what usually happens.",
        },
        {
          number: "03",
          title: "Notify and suggest rules",
          text: "Send a clear prompt, a recommendation, or a quiet approval when behavior stays normal.",
        },
      ],
    },
    infrastructure: {
      kicker: "Infrastructure",
      title: "Control without surrender, built on practical rails.",
      description:
        "Bill is designed for the V1 reality: user-controlled funds, balanced-risk card decisions, and no autonomous wallet movement behind the scenes.",
      bullets: [
        "Your wallet stays user-controlled.",
        "The agent governs card spending, not custody.",
        "Funding suggestions stay advisory in V1.",
      ],
      panelTitle: "What Bill can do now",
      panelCopy:
        "Approve normal recurring behavior, hold suspicious changes, and bring important subscription decisions back to you with context.",
      badges: [
        "User-controlled wallet",
        "Balanced-risk approvals",
        "Funding suggestions only",
      ],
      items: [
        {
          title: "Crossmint + Rain path",
          text: "The planned card path stays aligned with the official wallet and issuance flow.",
        },
        {
          title: "Brazil-first rollout",
          text: "The initial market framing stays local while the product language still feels global.",
        },
        {
          title: "Stablecoin-first stack",
          text: "Designed for modern spending rails without forcing protocol jargon into the product story.",
        },
        {
          title: "Balanced-risk decisioning",
          text: "Trusted recurring behavior should pass quietly. Unusual behavior should earn scrutiny.",
        },
      ],
    },
    form: {
      kicker: "Apply for access",
      title: "Early access is curated.",
      description:
        "Tell us how you pay today, how close you are to stablecoin spending, and where a subscription assistant would matter most.",
      fields: {
        name: "Name",
        email: "Email",
        country: "Country",
        stack: "Current payment stack",
        reason: "Why Bill now",
      },
      placeholders: {
        name: "Your name",
        email: "name@example.com",
        country: "Brazil, United States, ...",
        stack: "Apple Pay, bank transfer, card, stablecoins ...",
        reason: "What recurring spend do you want an assistant to watch?",
      },
      submit: "Submit application",
      success:
        "Application received. We will use it to shape the first wave of early access.",
      note: "No autonomous wallet movement is promised in V1.",
      asideTitle: "Who we are prioritizing",
      asideItems: [
        "Users with meaningful recurring digital spend",
        "People already testing stablecoin-backed spending",
        "Early adopters who want fewer surprise charges, not more dashboards",
      ],
    },
    footer: {
      summary: "Bill is a subscription assistant for governed recurring spend.",
      rights: "Designed for the V1 reality.",
    },
  },
  pt: {
    ui: {
      brandDescriptor: "Assistente de assinaturas",
      localeLabel: "Seletor de idioma",
      v1Scope: "Escopo da V1",
      updatingLanguage: "Atualizando idioma...",
    },
    navigation: {
      features: "Features",
      infrastructure: "Infrastructure",
      docs: "Docs",
      apply: "Apply",
    },
    hero: {
      eyebrow: "Controle calmo para gastos recorrentes",
      title: "Uma forma mais calma de gerenciar assinaturas.",
      description:
        "Bill sinaliza aumentos silenciosos, bloqueia cobrancas recorrentes suspeitas e pergunta antes das decisoes de cobranca que merecem sua atencao.",
      primaryCta: "Solicitar acesso",
      supportEyebrow: "Bill assistant",
      supportRows: [
        {
          symbol: "Z",
          merchant: "Z Cloud",
          note: "Mudanca de preco detectada",
          amount: "US$31.00",
          time: "1 min atras",
        },
        {
          symbol: "S",
          merchant: "Streamline",
          note: "Cobranca suspeita bloqueada",
          amount: "US$89.00",
          time: "3 min atras",
        },
        {
          symbol: "D",
          merchant: "Design Vault",
          note: "9 meses ativo",
          amount: "Revisar",
          time: "Hoje",
        },
      ],
      reviewCount: "3",
      reviewEyebrow: "Decisao pronta",
      reviewTitle: "Revise gasto recorrente com contexto.",
      reviewDescription: "Deriva de preco, anomalias e renovacoes em uma camada calma.",
    },
    assistant: {
      kicker: "Features",
      title: "Menos vigilancia manual. Decisoes melhores nos momentos que importam.",
      description:
        "Bill nao e mais um dashboard pedindo atencao constante. E um assistente de assinaturas que entra quando o gasto recorrente muda, deriva ou deixa de fazer sentido.",
      items: [
        {
          title: "Captura aumentos silenciosos",
          text: "Perceba mudancas antes que elas entrem no seu gasto mensal sem aviso.",
        },
        {
          title: "Revisa assinaturas antigas",
          text: "Traz a decisao de volta quando voce esta pagando no automatico ha tempo demais.",
        },
        {
          title: "Sinaliza cobrancas anormais",
          text: "Bloqueia ou revisa o que ja nao combina com o merchant ou com o seu padrao.",
        },
      ],
    },
    scenarios: {
      kicker: "Cenarios",
      title: "Decisoes concretas, apresentadas com calma em vez de ruido.",
      description:
        "Bill transforma gasto recorrente em poucos momentos de alta relevancia: o que mudou, por que importa e o que fazer agora.",
      items: [
        {
          tag: "Mudanca de preco detectada",
          merchant: "Z Cloud",
          amount: "US$24 -> US$31",
          message:
            "Seu plano subiu acima da faixa que voce costuma aprovar para este merchant.",
          context: "A confianca no merchant e alta. A deriva de valor nao.",
          primaryAction: "Aprovar preco",
          secondaryAction: "Manter regra atual",
        },
        {
          tag: "Bloqueado por comportamento incomum",
          merchant: "Streamline Media",
          amount: "Tentativa de US$89",
          message:
            "Bloqueamos uma tentativa de cobranca recorrente que nao combina com seu historico nesse merchant.",
          context: "O descriptor mudou. O valor saiu da sua banda historica.",
          primaryAction: "Manter bloqueio",
          secondaryAction: "Liberar uma vez",
        },
        {
          tag: "Hora de revisar",
          merchant: "Design Vault",
          amount: "US$19 / mes",
          message:
            "Voce paga essa assinatura ha 9 meses. Quer continuar ou cancelar na proxima renovacao?",
          context: "Sem prompt recente. Gasto continuo sem decisao nova.",
          primaryAction: "Manter por 30 dias",
          secondaryAction: "Cancelar na renovacao",
        },
      ],
    },
    how: {
      kicker: "Como funciona",
      title: "Bill revisa pagamentos recorrentes em tres camadas simples.",
      description:
        "O sistema fica silencioso em comportamento normal e so pede atencao quando merchant, valor ou padrao sai do esperado.",
      steps: [
        {
          number: "01",
          title: "Detecta padroes de cobranca",
          text: "Reconhece merchants recorrentes, descriptor patterns, bandas de valor e cadencia de renovacao.",
        },
        {
          number: "02",
          title: "Avalia confianca e desvio",
          text: "Compara a cobranca com o historico do merchant, suas regras e o que costuma acontecer.",
        },
        {
          number: "03",
          title: "Notifica e sugere regras",
          text: "Envia um prompt claro, uma recomendacao ou uma aprovacao silenciosa quando tudo segue normal.",
        },
      ],
    },
    infrastructure: {
      kicker: "Infrastructure",
      title: "Controle sem abrir mao, construido em trilhos praticos.",
      description:
        "Bill foi desenhado para a realidade da V1: fundos sob controle do usuario, decisoes balanced-risk no cartao e nenhum movimento autonomo da wallet por tras.",
      bullets: [
        "Sua wallet continua user-controlled.",
        "O agent governa gasto no cartao, nao custodia.",
        "Funding suggestions continuam consultivas na V1.",
      ],
      panelTitle: "O que Bill consegue fazer agora",
      panelCopy:
        "Aprovar comportamento recorrente normal, segurar mudancas suspeitas e devolver decisoes importantes de assinatura para voce com contexto.",
      badges: [
        "Wallet sob controle do usuario",
        "Aprovacoes balanced-risk",
        "Apenas funding suggestion",
      ],
      items: [
        {
          title: "Caminho Crossmint + Rain",
          text: "O fluxo planejado para cartao continua alinhado com wallet e emissao no caminho oficial.",
        },
        {
          title: "Rollout Brazil-first",
          text: "O primeiro recorte de mercado e local, enquanto a linguagem do produto continua global.",
        },
        {
          title: "Stack stablecoin-first",
          text: "Pensado para trilhos modernos de spending sem forcar jargao de protocolo na experiencia.",
        },
        {
          title: "Decisao balanced-risk",
          text: "Comportamento recorrente confiavel deve passar em silencio. O incomum merece escrutinio.",
        },
      ],
    },
    form: {
      kicker: "Solicitar acesso",
      title: "O early access e curado.",
      description:
        "Conta como voce paga hoje, o quao perto ja esta de gastar com stablecoins e onde um assistente de assinaturas faria mais diferenca.",
      fields: {
        name: "Nome",
        email: "Email",
        country: "Pais",
        stack: "Stack de pagamento atual",
        reason: "Por que Bill agora",
      },
      placeholders: {
        name: "Seu nome",
        email: "nome@exemplo.com",
        country: "Brasil, Estados Unidos, ...",
        stack: "Apple Pay, transferencia bancaria, cartao, stablecoins ...",
        reason: "Que gasto recorrente voce quer que um assistente acompanhe?",
      },
      submit: "Enviar aplicacao",
      success:
        "Aplicacao recebida. Vamos usar isso para desenhar a primeira onda de early access.",
      note: "A V1 nao promete movimentacao autonoma da wallet.",
      asideTitle: "Quem estamos priorizando",
      asideItems: [
        "Pessoas com gasto recorrente digital relevante",
        "Usuarios que ja testam spending com stablecoin",
        "Early adopters que querem menos surpresas e menos dashboards",
      ],
    },
    footer: {
      summary: "Bill e um assistente de assinaturas para gasto recorrente governado.",
      rights: "Desenhado para a realidade da V1.",
    },
  },
};
