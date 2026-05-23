export type RankingEntry = {
  id: string;
  name: string;
  score: number;
  medal: string;
  badge: "Explorador do Forró" | "Colecionador Junino" | "Mestre da Sanfona";
};

export const ranking: RankingEntry[] = [
  { id: "turista", name: "Turista de Experiência", score: 1480, medal: "Ouro", badge: "Mestre da Sanfona" },
  { id: "jovem", name: "Jovem Aracajuano", score: 1230, medal: "Prata", badge: "Colecionador Junino" },
  { id: "familia", name: "Família Gonzaguinha", score: 990, medal: "Bronze", badge: "Explorador do Forró" }
];
