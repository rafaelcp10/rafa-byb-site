import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { SITE_URL } from './src/consts.ts';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  trailingSlash: 'never',
  // Todas as páginas continuam estáticas (prerendered). O adapter só é necessário
  // pela rota /api/newsletter (export const prerender = false), que precisa rodar
  // sob demanda para chamar a API do Kit.
  adapter: vercel(),
});
