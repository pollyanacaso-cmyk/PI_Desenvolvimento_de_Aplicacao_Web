export interface ItemCarrinho {
  servico: {
    id: number;
    nome: string;
    preco: number | string;
    duracao_minutos: number;
  };
  profissionalId?: number;
  profissionalNome?: string;
} 
