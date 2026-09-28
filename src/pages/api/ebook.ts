import type { APIRoute } from 'astro';
import { subscribeToEbook, KitNotConfiguredError, KitApiError } from '../../lib/kit';

// Mesmo padrão de /api/newsletter: rota sob demanda (não entra no HTML estático), chave da
// API só no servidor. Ver src/lib/kit.ts para a integração em si.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const { email, nome, origem, referrer, website } = (body ?? {}) as {
    email?: string;
    nome?: string;
    origem?: string;
    referrer?: string;
    website?: string;
  };

  // Honeypot: campo invisível que só um bot preenche. Responde como sucesso para não
  // entregar a regra, mas não chama o Kit.
  if (website) {
    return Response.json({ ok: true, jaEraInscrito: false });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'Informe um e-mail válido.' }, { status: 400 });
  }

  try {
    const { jaEraInscrito } = await subscribeToEbook({
      email,
      firstName: nome?.trim() || undefined,
      origem: origem?.slice(0, 250) || undefined,
      referrer: referrer?.slice(0, 500) || undefined,
    });

    // Quem já era inscrito confirmado não recebe de novo o e-mail de entrega do Kit —
    // nesse caso devolvemos o link direto do PDF (só se estiver configurado).
    const downloadUrl = jaEraInscrito ? import.meta.env.KIT_EBOOK_PDF_URL || null : null;

    return Response.json({ ok: true, jaEraInscrito, downloadUrl });
  } catch (err) {
    if (err instanceof KitNotConfiguredError) {
      return Response.json(
        { ok: false, error: 'Integração com o Kit ainda não configurada.' },
        { status: 501 }
      );
    }
    if (err instanceof KitApiError) {
      console.error('[ebook] Kit API error:', err.message);
      return Response.json({ ok: false, error: 'Não foi possível confirmar a inscrição agora.' }, { status: 502 });
    }
    console.error('[ebook] erro inesperado:', err);
    return Response.json({ ok: false, error: 'Erro inesperado.' }, { status: 500 });
  }
};
