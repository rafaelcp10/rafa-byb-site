import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artigos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artigos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      slug: z.string(),
      categoria: z.enum([
        'disciplina',
        'produtividade',
        'mentalidade',
        'sucesso',
        'familia',
        'saude',
      ]),
      registro: z.enum(['execucao', 'humano']),
      data: z.coerce.date(),
      tempo_leitura: z.string(),
      tempo_video: z.string().optional(),
      titulo_seo: z.string(),
      meta_description: z.string(),
      resumo: z.string(),
      video_youtube: z.string().optional(),
      imagem_capa: image(),
    }),
});

export const collections = { artigos };
