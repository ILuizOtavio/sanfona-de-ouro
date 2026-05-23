export type RewardStatus = "disponível" | "usado" | "bloqueado";

export type Reward = {
  id: string;
  merchant: string;
  description: string;
  status: RewardStatus;
  requiredPoints: number;
};

export const rewards: Reward[] = [
  { id: "milho", merchant: "Barraca Dona Nena", description: "10% de desconto no milho verde", status: "disponível", requiredPoints: 10 },
  { id: "amendoim", merchant: "Tabuleiro do Seu Beto", description: "Amendoim cozido", status: "disponível", requiredPoints: 20 },
  { id: "canjica", merchant: "Quitutes da Coroa do Meio", description: "Canjica cremosa", status: "bloqueado", requiredPoints: 35 },
  { id: "tapioca", merchant: "Tapioca da Orla", description: "Tapioca regional", status: "disponível", requiredPoints: 25 },
  { id: "artesanato", merchant: "Ateliê Sergipe Feito à Mão", description: "Artesanato local", status: "bloqueado", requiredPoints: 50 }
];
