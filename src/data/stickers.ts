export type StickerRarity = "comum" | "rara" | "brilhante";

export type Sticker = {
  id: string;
  name: string;
  category: string;
  rarity: StickerRarity;
  story: string;
  palette: string[];
};

export const stickers: Sticker[] = [
  {
    id: "luiz-gonzaga",
    name: "Luiz Gonzaga",
    category: "Mestre do Baião",
    rarity: "brilhante",
    story: "O Rei do Baião popularizou a sanfona, a zabumba e o triângulo como símbolos do Nordeste para o Brasil inteiro.",
    palette: ["#F8C23A", "#B63822", "#241512"]
  },
  {
    id: "gonzaguinha",
    name: "Gonzaguinha",
    category: "Memória Musical",
    rarity: "rara",
    story: "Sua obra atravessa gerações e conecta afeto, crítica social e identidade brasileira em canções memoráveis.",
    palette: ["#E85D2A", "#7A2E17", "#FFF1C7"]
  },
  {
    id: "clemilda",
    name: "Clemilda",
    category: "Forró Sergipano",
    rarity: "brilhante",
    story: "Clemilda levou a irreverência e a força do forró sergipano aos palcos e rádios do país.",
    palette: ["#F6D15B", "#287A45", "#7A2E17"]
  },
  {
    id: "gerson-filho",
    name: "Gerson Filho",
    category: "Sanfona de Oito Baixos",
    rarity: "rara",
    story: "Nascido em Sergipe, Gerson Filho é referência da sanfona de oito baixos e do forró instrumental.",
    palette: ["#287A45", "#F8C23A", "#241512"]
  },
  {
    id: "forro-caju",
    name: "Forró Caju",
    category: "Festa Junina",
    rarity: "brilhante",
    story: "Um dos maiores festejos juninos de Aracaju, reunindo shows, quadrilhas, comidas típicas e cultura popular.",
    palette: ["#B63822", "#F8C23A", "#287A45"]
  },
  {
    id: "mercado-municipal",
    name: "Mercado Municipal",
    category: "Ponto Cultural",
    rarity: "comum",
    story: "O mercado concentra sabores, artesanato, encontros e uma parte viva da memória cotidiana de Aracaju.",
    palette: ["#7A2E17", "#E85D2A", "#FFF1C7"]
  },
  {
    id: "rua-sao-joao",
    name: "Rua de São João",
    category: "Tradição",
    rarity: "rara",
    story: "Lugar emblemático da festa, onde a rua vira palco para celebrar o ciclo junino sergipano.",
    palette: ["#F8C23A", "#287A45", "#B63822"]
  },
  {
    id: "orla-atalaia",
    name: "Orla de Atalaia",
    category: "Cartão-postal",
    rarity: "comum",
    story: "A orla combina turismo, lazer e paisagem costeira, conectando visitantes ao ritmo de Aracaju.",
    palette: ["#287A45", "#49A7A1", "#FFF1C7"]
  },
  {
    id: "quadrilhas-juninas",
    name: "Quadrilhas Juninas",
    category: "Dança Popular",
    rarity: "comum",
    story: "Coreografias, figurinos e narrativas celebram a criatividade coletiva das comunidades juninas.",
    palette: ["#E85D2A", "#F8C23A", "#7A2E17"]
  },
  {
    id: "forro-pe-de-serra",
    name: "Forró pé-de-serra",
    category: "Raiz do Forró",
    rarity: "comum",
    story: "Sanfona, zabumba e triângulo mantêm acesa a batida que faz o São João ser vivido no corpo.",
    palette: ["#B63822", "#287A45", "#F8C23A"]
  }
];
