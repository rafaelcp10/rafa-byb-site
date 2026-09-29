// Inscrição nos formulários do Kit, feita a partir do navegador do visitante.
//
// POR QUE DO NAVEGADOR E NÃO DO SERVIDOR
// O e-mail de confirmação/entrega do Kit é disparado pelo fluxo do formulário, não pela API
// de subscribers (que cria o contato já confirmado e não envia nada). E o endpoint público do
// formulário tem antispam: chamadas vindas do servidor saem todas do mesmo IP, sem navegador
// real, e acabam marcadas como "quarantined". Postando do navegador, o Kit vê o IP e o agente
// de quem realmente se inscreveu — igual ao formulário embutido dele.
//
// O endpoint responde com CORS liberado, então dá para ler a resposta normalmente.

const KIT_FORMS_BASE = 'https://app.kit.com/forms';

export interface KitFormResult {
  ok: boolean;
  /** Preenchido quando o Kit põe o envio em quarentena: a pessoa precisa concluir a verificação. */
  quarantineUrl?: string;
}

export async function subscribeToKitForm(
  formId: string,
  { email, firstName, fields }: { email: string; firstName?: string; fields?: Record<string, string> }
): Promise<KitFormResult> {
  const body = new URLSearchParams();
  body.set('email_address', email);
  if (firstName) body.set('first_name', firstName);
  for (const [chave, valor] of Object.entries(fields ?? {})) {
    body.set(`fields[${chave}]`, valor);
  }

  const res = await fetch(`${KIT_FORMS_BASE}/${formId}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  });

  if (!res.ok) return { ok: false };

  const data = await res.json().catch(() => null);

  if (data?.status === 'quarantined' && data?.url) {
    return { ok: true, quarantineUrl: data.url };
  }

  return { ok: data?.status === 'success' };
}
