export type CategoriaId =
  | 'disciplina'
  | 'produtividade'
  | 'mentalidade'
  | 'sucesso'
  | 'familia'
  | 'saude';

export interface Categoria {
  id: CategoriaId;
  slug: string;
  nome: string;
  curto: string;
  seoTitle: string;
  metaDescription: string;
  intro: string;
  relacionadas: CategoriaId[];
}

export const CATEGORIAS: Record<CategoriaId, Categoria> = {
  disciplina: {
    id: 'disciplina',
    slug: 'disciplina-e-execucao',
    nome: 'Disciplina e Execução',
    curto: 'Disciplina',
    seoTitle: 'Disciplina e Execução | Rafa Byb — Be Your Best',
    metaDescription:
      'Artigos sobre consistência, execução e o que separa quem só planeja de quem constrói. Disciplina prática, sem fórmula mágica.',
    intro:
      'Disciplina não é força de vontade nem sofrimento — é a decisão repetida de cumprir o que você prometeu a si mesmo, mesmo quando ninguém está olhando. Aqui você encontra os conteúdos do Rafa Byb sobre consistência, execução e o que realmente separa quem só planeja de quem constrói. Nada de fórmula mágica: são ideias testadas na prática, do tamanho certo pra sobreviver a uma semana ruim.',
    relacionadas: ['produtividade', 'mentalidade'],
  },
  produtividade: {
    id: 'produtividade',
    slug: 'produtividade-e-rotina',
    nome: 'Produtividade e Rotina',
    curto: 'Produtividade',
    seoTitle: 'Produtividade e Rotina | Rafa Byb — Be Your Best',
    metaDescription:
      'Artigos sobre rotina, foco e produtividade real — sem hack milagroso. Como organizar o seu dia para que ele funcione mesmo nas semanas difíceis.',
    intro:
      'Produtividade não é fazer mais coisas — é escolher melhor o que fica de fora. Aqui você encontra os conteúdos do Rafa Byb sobre rotina, foco e organização prática do dia a dia, pensados para quem trabalha, treina e ainda quer sobrar tempo pra família. Sem aplicativo mágico, sem planilha perfeita: só o que realmente sustenta uma rotina que funciona mesmo quando a semana desanda.',
    relacionadas: ['disciplina', 'saude'],
  },
  mentalidade: {
    id: 'mentalidade',
    slug: 'mentalidade-e-identidade',
    nome: 'Mentalidade e Identidade',
    curto: 'Mentalidade',
    seoTitle: 'Mentalidade e Identidade | Rafa Byb — Be Your Best',
    metaDescription:
      'Como a forma que você pensa sobre si mesmo determina suas escolhas diárias. Artigos sobre identidade, crenças e a construção da sua melhor versão.',
    intro:
      'Antes de mudar o comportamento, você precisa mudar a história que conta sobre quem você é. Aqui estão os conteúdos do Rafa Byb sobre mentalidade, identidade e os padrões de pensamento que sustentam — ou sabotam — suas decisões diárias. A ideia não é positividade forçada: é entender por que você age do jeito que age, e o que fazer com isso.',
    relacionadas: ['disciplina', 'sucesso'],
  },
  sucesso: {
    id: 'sucesso',
    slug: 'sucesso-trabalho-e-ambicao',
    nome: 'Sucesso, Trabalho e Ambição',
    curto: 'Sucesso',
    seoTitle: 'Sucesso, Trabalho e Ambição | Rafa Byb — Be Your Best',
    metaDescription:
      'O que realmente significa ter sucesso além de dinheiro e status. Artigos sobre carreira, ambição e trabalho com propósito.',
    intro:
      'Sucesso não é só dinheiro, cargo ou reconhecimento — é também ser alguém em quem as pessoas confiam. Aqui estão os conteúdos do Rafa Byb sobre carreira, ambição e trabalho, pensados para quem quer crescer profissionalmente sem abrir mão do resto da vida. Ambição sem direção vira ansiedade; aqui a ideia é dar direção pra ela.',
    relacionadas: ['mentalidade', 'familia'],
  },
  familia: {
    id: 'familia',
    slug: 'paternidade-familia-e-relacionamentos',
    nome: 'Paternidade, Família e Relacionamentos',
    curto: 'Família',
    seoTitle: 'Paternidade, Família e Relacionamentos | Rafa Byb',
    metaDescription:
      'Como crescer na vida profissional sem se ausentar de casa. Artigos sobre paternidade, família e presença real no dia a dia.',
    intro:
      'Nenhuma conquista profissional compensa a ausência em casa — mas presença também não é sinônimo de estar fisicamente no mesmo cômodo. Aqui estão os conteúdos do Rafa Byb sobre paternidade, relacionamentos e o que significa, na prática, estar presente para quem você ama enquanto constrói uma carreira e uma vida melhores.',
    relacionadas: ['sucesso', 'saude'],
  },
  saude: {
    id: 'saude',
    slug: 'saude-energia-e-equilibrio',
    nome: 'Saúde, Energia e Equilíbrio',
    curto: 'Saúde',
    seoTitle: 'Saúde, Energia e Equilíbrio | Rafa Byb — Be Your Best',
    metaDescription:
      'Sono, treino e alimentação como decisões estratégicas, não estética. Artigos sobre saúde física e mental para sustentar tudo o resto.',
    intro:
      'O corpo é a infraestrutura de tudo o que você constrói — carreira, família, disciplina. Sem sono, treino e alimentação em ordem, o resto desmorona mais rápido do que parece. Aqui estão os conteúdos do Rafa Byb sobre saúde, energia e equilíbrio, tratados como parte estratégica da sua vida, não como vaidade ou luxo.',
    relacionadas: ['produtividade', 'familia'],
  },
};

export const CATEGORIA_LIST = Object.values(CATEGORIAS);

export function categoriaByCurto(curto: string): Categoria | undefined {
  return CATEGORIA_LIST.find((c) => c.curto === curto);
}
