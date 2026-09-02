import type { APIRoute } from 'astro';
import { subscribeToKit, KitNotConfiguredError, KitApiError } from '../../lib/kit';

// Rota renderizada sob demanda (não fica no HTML estático) — precisa de um adapter
// (@astrojs/vercel, @astrojs/netlify, @astrojs/node...) instalado e configurado em
// astro.config.mjs para funcionar em produção. Em `astro dev` funciona sem adapter,
// então dá pra testar assim que KIT_API_KEY/KIT_FORM_ID estiverem no .env.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const { email, preferencia } = (body ?? {}) as { email?: string; preferencia?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'Informe um e-mail válido.' }, { status: 400 });
  }

  try {
    await subscribeToKit({ email, preferencia });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof KitNotConfiguredError) {
      return Response.json(
        { ok: false, error: 'Integração com o Kit ainda não configurada.' },
        { status: 501 }
      );
    }
    if (err instanceof KitApiError) {
      console.error('[newsletter] Kit API error:', err.message);
      return Response.json({ ok: false, error: 'Não foi possível confirmar a inscrição agora.' }, { status: 502 });
    }
    console.error('[newsletter] erro inesperado:', err);
    return Response.json({ ok: false, error: 'Erro inesperado.' }, { status: 500 });
  }
};
