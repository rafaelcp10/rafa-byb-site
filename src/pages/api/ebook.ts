import type { APIRoute } from 'astro';
import { marcarLeadDoEbook, KitNotConfiguredError, KitApiError } from '../../lib/kit';

// Rota sob demanda (não entra no HTML estático), para a chave da API do Kit ficar só no
// servidor. A inscrição no formulário já foi feita pelo navegador (src/scripts/kit-form.ts);
// aqui só aplicamos a tag e descobrimos se a pessoa já era inscrita confirmada.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const { email, website } = (body ?? {}) as { email?: string; website?: string };

  // Honeypot: campo invisível que só um bot preenche.
  if (website) {
    return Response.json({ ok: true, jaEraInscrito: false, downloadUrl: null });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'Informe um e-mail válido.' }, { status: 400 });
  }

  try {
    const { jaEraInscrito } = await marcarLeadDoEbook(email);

    // Quem já era inscrito confirmado não recebe de novo o e-mail de entrega do Kit —
    // nesse caso devolvemos o link direto do PDF (só se estiver configurado).
    const downloadUrl = jaEraInscrito ? import.meta.env.KIT_EBOOK_PDF_URL || null : null;

    return Response.json({ ok: true, jaEraInscrito, downloadUrl });
  } catch (err) {
    if (err instanceof KitNotConfiguredError) {
      return Response.json({ ok: false, error: 'Integração com o Kit ainda não configurada.' }, { status: 501 });
    }
    if (err instanceof KitApiError) {
      console.error('[ebook] Kit API error:', err.message);
      return Response.json({ ok: false, error: 'Não foi possível concluir agora.' }, { status: 502 });
    }
    console.error('[ebook] erro inesperado:', err);
    return Response.json({ ok: false, error: 'Erro inesperado.' }, { status: 500 });
  }
};
