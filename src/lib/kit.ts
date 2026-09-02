// Integração com a API v4 do Kit (antigo ConvertKit — https://developers.kit.com).
//
// Fluxo: 1) upsert do subscriber via POST /v4/subscribers (cria se o e-mail não existir,
// atualiza o nome se já existir); 2) associa esse subscriber ao formulário específico via
// POST /v4/forms/{form_id}/subscribers, o que dispara as automações/sequência ligadas a esse
// formulário no Kit. As duas chamadas usam o header `X-Kit-Api-Key`.
//
// Configuração: defina KIT_API_KEY e KIT_FORM_ID nas variáveis de ambiente (veja .env.example).
// Sem essas variáveis, subscribeToKit lança KitNotConfiguredError — o endpoint que a chama
// (src/pages/api/newsletter.ts) trata isso como "integração ainda não configurada".

const KIT_API_BASE = 'https://api.kit.com/v4';

export class KitNotConfiguredError extends Error {
  constructor() {
    super('KIT_API_KEY ou KIT_FORM_ID não configurados.');
    this.name = 'KitNotConfiguredError';
  }
}

export class KitApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'KitApiError';
    this.status = status;
  }
}

export interface SubscribeInput {
  email: string;
  firstName?: string;
  /** Preferência de registro escolhida no form: 'execucao' | 'humano' | 'ambos'. */
  preferencia?: string;
}

export async function subscribeToKit({ email, firstName, preferencia }: SubscribeInput): Promise<void> {
  const apiKey = import.meta.env.KIT_API_KEY;
  const formId = import.meta.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    throw new KitNotConfiguredError();
  }

  const headers = {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };

  const subscriberRes = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email_address: email,
      first_name: firstName || null,
      fields: preferencia ? { preferencia } : undefined,
    }),
  });

  if (!subscriberRes.ok) {
    const detail = await subscriberRes.text();
    throw new KitApiError(`Falha ao criar/atualizar subscriber no Kit: ${detail}`, subscriberRes.status);
  }

  const formRes = await fetch(`${KIT_API_BASE}/forms/${formId}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email_address: email }),
  });

  if (!formRes.ok) {
    const detail = await formRes.text();
    throw new KitApiError(`Falha ao associar subscriber ao formulário no Kit: ${detail}`, formRes.status);
  }
}
