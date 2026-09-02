import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '../consts';

export const GET: APIRoute = async (context) => {
  const artigos = await getCollection('artigos');
  const sorted = artigos.sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: sorted.map((artigo) => ({
      title: artigo.data.titulo,
      description: artigo.data.resumo,
      pubDate: artigo.data.data,
      link: `/artigos/${artigo.data.slug}`,
    })),
  });
};
