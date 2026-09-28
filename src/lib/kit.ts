// Integração com a API v4 do Kit (antigo ConvertKit — https://developers.kit.com).
//
// Este é o único ponto de contato do site com o Kit. Tanto a newsletter quanto a captura
// do e-book passam pelas mesmas funções de baixo nível (kitPost/upsertSubscriber/addToForm),
// mudando só o formulário de destino e o que é gravado no subscriber.
//
// Fluxo comum: 1) upsert do subscriber via POST /v4/subscribers (cria se o e-mail não existir,
// atualiza nome/campos se já existir); 2) associa esse subscriber ao formulário via
// POST /v4/forms/{form_id}/subscribers, o que dispara o que estiver ligado àquele formulário.
// Todas as chamadas usam o header `X-Kit-Api-Key`.
//
// Configuração: KIT_API_KEY, KIT_FORM_ID (newsletter) e KIT_EBOOK_FORM_ID (e-book) nas
// variáveis de ambiente — veja .env.example. Sem elas, as funções lançam KitNotConfiguredError,
// que as rotas de API tratam como "integração ainda não configurada".

const KIT_API_BASE = 'https://api.kit.com/v4';

export class KitNotConfiguredError extends Error {
  constructor(what = 'KIT_API_KEY ou KIT_FORM_ID') {
    super(`${what} não configurado(s).`);
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

function headers(apiKey: string) {
  return { 'X-Kit-Api-Key': apiKey, 'Content-Type': 'application/json' };
}

async function kitPost(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
  descricao: string
): Promise<{ status: number; data: any }> {
  const res = await fetch(`${KIT_API_BASE}${path}`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new KitApiError(`${descricao}: ${await res.text()}`, res.status);
  }

  return { status: res.status, data: await res.json().catch(() => ({})) };
}

/**
 * Cria ou atualiza o subscriber. O Kit responde 201 quando o e-mail é novo e 200 quando
 * já existia — é assim que sabemos se a pessoa já era da lista.
 */
async function upsertSubscriber(
  apiKey: string,
  { email, firstName, fields }: { email: string; firstName?: string; fields?: Record<string, string> }
): Promise<{ jaExistia: boolean }> {
  const { status } = await kitPost(
    apiKey,
    '/subscribers',
    {
      email_address: email,
      first_name: firstName || null,
      fields: fields && Object.keys(fields).length > 0 ? fields : undefined,
    },
    'Falha ao criar/atualizar subscriber no Kit'
  );

  return { jaExistia: status === 200 };
}

/** Associa um subscriber já existente a um formulário. O Kit extrai as UTMs de `referrer`. */
async function addToForm(apiKey: string, formId: string, email: string, referrer?: string) {
  await kitPost(
    apiKey,
    `/forms/${formId}/subscribers`,
    { email_address: email, referrer: referrer || null },
    'Falha ao associar subscriber ao formulário no Kit'
  );
}

/** POST /v4/tags é idempotente: cria a tag ou devolve a existente (match por nome). */
async function ensureTag(apiKey: string, name: string): Promise<number> {
  const { data } = await kitPost(apiKey, '/tags', { name }, 'Falha ao criar/obter tag no Kit');
  return data?.tag?.id;
}

async function tagSubscriber(apiKey: string, tagId: number, email: string) {
  await kitPost(apiKey, `/tags/${tagId}/subscribers`, { email_address: email }, 'Falha ao aplicar tag no Kit');
}

export interface SubscribeInput {
  email: string;
  firstName?: string;
  /** Preferência de registro escolhida no form: 'execucao' | 'humano' | 'ambos'. */
  preferencia?: string;
}

/** Newsletter: inscreve no formulário padrão (KIT_FORM_ID). */
export async function subscribeToKit({ email, firstName, preferencia }: SubscribeInput): Promise<void> {
  const apiKey = import.meta.env.KIT_API_KEY;
  const formId = import.meta.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    throw new KitNotConfiguredError('KIT_API_KEY ou KIT_FORM_ID');
  }

  await upsertSubscriber(apiKey, { email, firstName, fields: preferencia ? { preferencia } : undefined });
  await addToForm(apiKey, formId, email);
}

export interface EbookSubscribeInput {
  email: string;
  firstName?: string;
  /** UTMs compactadas da página de origem, gravadas no campo personalizado "origem". */
  origem?: string;
  /** URL completa de origem (com UTMs) — o Kit extrai e reporta as UTMs a partir dela. */
  referrer?: string;
}

export const EBOOK_TAG = 'ebook-21-dias';

/**
 * E-book "Desafios de 21 Dias": inscreve no formulário do e-book (KIT_EBOOK_FORM_ID),
 * grava a origem e aplica a tag ebook-21-dias (criada sob demanda, já que o plano
 * gratuito do Kit não tem automações para aplicá-la).
 *
 * Devolve `jaEraInscrito` para a interface decidir se mostra o link direto do PDF:
 * quem já é inscrito confirmado não recebe de novo o e-mail de entrega do Kit.
 */
export async function subscribeToEbook({
  email,
  firstName,
  origem,
  referrer,
}: EbookSubscribeInput): Promise<{ jaEraInscrito: boolean }> {
  const apiKey = import.meta.env.KIT_API_KEY;
  const formId = import.meta.env.KIT_EBOOK_FORM_ID;

  if (!apiKey || !formId) {
    throw new KitNotConfiguredError('KIT_API_KEY ou KIT_EBOOK_FORM_ID');
  }

  const { jaExistia } = await upsertSubscriber(apiKey, {
    email,
    firstName,
    fields: origem ? { origem } : undefined,
  });

  await addToForm(apiKey, formId, email, referrer);

  const tagId = await ensureTag(apiKey, EBOOK_TAG);
  if (tagId) await tagSubscriber(apiKey, tagId, email);

  return { jaEraInscrito: jaExistia };
}
