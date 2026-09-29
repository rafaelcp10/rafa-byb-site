// Parte servidor da integração com o Kit (antigo ConvertKit).
//
// A INSCRIÇÃO EM SI NÃO PASSA POR AQUI. Ela é feita pelo navegador do visitante, direto no
// endpoint público do formulário (ver src/scripts/kit-form.ts) — é o único caminho que faz o
// Kit enviar o e-mail de confirmação/entrega, e o que o antispam dele espera ver.
//
// Este módulo cuida só do que exige a chave secreta (KIT_API_KEY): consultar se o e-mail já
// era confirmado e aplicar a tag do e-book (o plano gratuito do Kit não tem automação p/ isso).

const KIT_API_BASE = 'https://api.kit.com/v4';

export class KitNotConfiguredError extends Error {
  constructor(what = 'KIT_API_KEY') {
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

async function kitApiPost(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
  descricao: string
): Promise<any> {
  const res = await fetch(`${KIT_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'X-Kit-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new KitApiError(`${descricao}: ${await res.text()}`, res.status);
  }

  return res.json().catch(() => ({}));
}

/**
 * Diz se o e-mail já é um contato confirmado. A listagem padrão do Kit devolve só contatos
 * confirmados, que é exatamente o sinal que queremos: quem está com opt-in pendente não
 * aparece aqui e, portanto, ainda vai receber o e-mail do formulário.
 */
async function jaConfirmado(apiKey: string, email: string): Promise<boolean> {
  const res = await fetch(`${KIT_API_BASE}/subscribers?email_address=${encodeURIComponent(email)}`, {
    headers: { 'X-Kit-Api-Key': apiKey },
  });

  if (!res.ok) return false;

  const data = await res.json().catch(() => null);
  return data?.subscribers?.[0]?.state === 'active';
}

/** POST /v4/tags é idempotente: cria a tag ou devolve a existente (match por nome). */
async function ensureTag(apiKey: string, name: string): Promise<number | undefined> {
  const data = await kitApiPost(apiKey, '/tags', { name }, 'Falha ao criar/obter tag no Kit');
  return data?.tag?.id;
}

export const EBOOK_TAG = 'ebook-21-dias';

/**
 * Aplica a tag do e-book. Chamado depois que o navegador já inscreveu a pessoa no formulário.
 * Taggear não altera o estado do contato — quem está com opt-in pendente continua pendente.
 *
 * Devolve `jaEraInscrito` para a interface decidir se mostra o link direto do PDF: quem já
 * estava confirmado não recebe de novo o e-mail de entrega do Kit.
 */
export async function marcarLeadDoEbook(email: string): Promise<{ jaEraInscrito: boolean }> {
  const apiKey = import.meta.env.KIT_API_KEY;

  if (!apiKey) {
    throw new KitNotConfiguredError('KIT_API_KEY');
  }

  const jaEraInscrito = await jaConfirmado(apiKey, email);

  const tagId = await ensureTag(apiKey, EBOOK_TAG);
  if (tagId) {
    await kitApiPost(
      apiKey,
      `/tags/${tagId}/subscribers`,
      { email_address: email },
      'Falha ao aplicar tag no Kit'
    );
  }

  return { jaEraInscrito };
}
