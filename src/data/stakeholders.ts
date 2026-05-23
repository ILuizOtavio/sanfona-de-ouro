export type Stakeholder = {
  id: string;
  title: string;
  accent: string;
  points: string[];
};

export const stakeholders: Stakeholder[] = [
  {
    id: "prefeitura",
    title: "Prefeitura de Aracaju / Funcaju",
    accent: "#287A45",
    points: [
      "Apoia com validação institucional",
      "Infraestrutura física com QR Codes em totens, pontos turísticos e barracas",
      "Ganha dados analíticos em tempo real sobre fluxo turístico"
    ]
  },
  {
    id: "patrocinadores",
    title: "Grandes patrocinadores",
    accent: "#F6D15B",
    points: [
      "Exemplos: Banese, Ambev e marcas locais",
      "Financiam plataforma e prêmios",
      "Ganham publicidade nativa e gamificada",
      "Patrocinam figurinhas raras/douradas"
    ]
  },
  {
    id: "comerciantes",
    title: "Pequenos comerciantes e barraqueiros",
    accent: "#E85D2A",
    points: [
      "Pontos de resgate de cupons",
      "Não pagam para participar",
      "Ganham fluxo de clientes"
    ]
  },
  {
    id: "publico",
    title: "Público final",
    accent: "#B63822",
    points: [
      "Turistas e moradores",
      "Usam grátis",
      "Ganham experiência cultural, cupons e interação social"
    ]
  }
];
