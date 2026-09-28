// Catálogo de produtos da página /produtos. Para publicar um produto novo, acrescente um
// item aqui — a página monta a grade sozinha. `disponivel: false` mostra o item como
// "em breve", sem link.

export type TipoProduto = 'ebook' | 'curso' | 'treinamento' | 'aplicativo';

export interface Produto {
  id: string;
  tipo: TipoProduto;
  titulo: string;
  resumo: string;
  /** Rótulo de preço mostrado em destaque: 'Grátis', 'R$ 97', etc. */
  preco: string;
  /** Para onde o card leva. Omitir quando `disponivel` for false. */
  href?: string;
  cta?: string;
  disponivel: boolean;
}

export const TIPO_LABEL: Record<TipoProduto, string> = {
  ebook: 'E-book',
  curso: 'Curso',
  treinamento: 'Treinamento',
  aplicativo: 'Aplicativo',
};

export const PRODUTOS: Produto[] = [
  {
    id: '21dias',
    tipo: 'ebook',
    titulo: 'Desafios de 21 Dias',
    resumo:
      'Um passo a passo prático para sair do piloto automático e dar o primeiro passo para construir a sua melhor versão. Um desafio por dia, aplicável na rotina real.',
    preco: 'Grátis',
    href: '/21dias',
    cta: 'Baixar grátis',
    disponivel: true,
  },
];
