export const SITE_URL = 'https://rafabeyourbest.com';

export const SITE_NAME = 'Rafa Byb — Be Your Best';

export const SITE_DESCRIPTION =
  'Uma ideia, uma perspectiva e uma ação por semana. Disciplina, clareza e execução sem abrir mão de saúde e família.';

export const AUTHOR_NAME = 'Rafael';

// IDs dos formulários do Kit. Não são segredo: aparecem no embed público de cada formulário.
// A inscrição é feita pelo navegador do visitante direto no endpoint do Kit (ver
// src/scripts/kit-form.ts) — é isso que dispara o e-mail de confirmação/entrega e o que o
// antispam do Kit espera ver (IP e navegador reais de quem se inscreveu).
export const KIT_FORMS = {
  newsletter: '9869205',
  ebook21dias: '9973669',
} as const;

export const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@Rafabyb',
  instagram: 'https://www.instagram.com/rafa_byb_oficial',
  email: 'mailto:rafael.piresweb@gmail.com',
};
