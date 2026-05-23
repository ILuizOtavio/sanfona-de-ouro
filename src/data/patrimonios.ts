// ─── Patrimônios Históricos e Culturais de Sergipe ───────────────────

export type PatrimonioTipo = "material" | "imaterial";
export type PatrimonioCategoria =
  | "Igreja" | "Museu" | "Mercado" | "Centro Cultural" | "Monumento"
  | "Arquitetura" | "Cidade Histórica" | "Praça" | "Estátua"
  | "Forró" | "Vaquejada" | "Cordel" | "Quadrilha" | "Festa Popular"
  | "Culinária" | "Artesanato" | "Samba de Coco" | "Reisado" | "Folclore";

export type Patrimonio = {
  id: string;
  nome: string;
  tipo: PatrimonioTipo;
  categoria: PatrimonioCategoria;
  descricao: string;
  localizacao: string;
  curiosidade: string;
  imagem: string;
  imagemFallback: string;
  cor: string;
  emoji: string;
  destaque?: boolean;
};

export const patrimonios: Patrimonio[] = [
  // ─── MATERIAIS ────────────────────────────────────────────────────

  // Igrejas
  {
    id: "igreja-sao-francisco",
    nome: "Igreja de São Francisco",
    tipo: "material", categoria: "Igreja",
    descricao: "Uma das mais belas igrejas barrocas do Nordeste, construída pelos franciscanos no século XVII. Seu interior exibe talha dourada e azulejos portugueses únicos no Brasil.",
    localizacao: "São Cristóvão, Sergipe",
    curiosidade: "São Cristóvão é a 4ª cidade mais antiga do Brasil, e a Igreja de São Francisco foi tombada pela UNESCO como Patrimônio Mundial em 2010.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/S%C3%A3o_Crist%C3%B3v%C3%A3o_-_Igreja_Franciscana.jpg/1280px-S%C3%A3o_Crist%C3%B3v%C3%A3o_-_Igreja_Franciscana.jpg",
    imagemFallback: "/imagens/igreja_sao_francisco.jpeg",
    cor: "#F8C23A", emoji: "⛪", destaque: true,
  },
  {
    id: "catedral-aracaju",
    nome: "Catedral Metropolitana",
    tipo: "material", categoria: "Igreja",
    descricao: "A Catedral Metropolitana de Aracaju, dedicada a Nossa Senhora da Conceição, é o principal templo católico da capital sergipana, com arquitetura neogótica imponente.",
    localizacao: "Centro, Aracaju – SE",
    curiosidade: "Foi construída no século XIX e sua torre principal tem 45 metros de altura, sendo visível de vários pontos da cidade.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Catedral_Metropolitana_de_Aracaju.jpg/1280px-Catedral_Metropolitana_de_Aracaju.jpg",
    imagemFallback: "/imagens/catedral_metropolitana.jpeg",
    cor: "#B63822", emoji: "🕍",
  },

  // Museus
  {
    id: "museu-gente-sergipana",
    nome: "Museu da Gente Sergipana",
    tipo: "material", categoria: "Museu",
    descricao: "Museu interativo inaugurado em 2011 que narra a história e cultura do povo sergipano com tecnologia de ponta, instalações imersivas e acervo riquíssimo.",
    localizacao: "Aracaju, SE",
    curiosidade: "É considerado um dos museus mais modernos do Nordeste, com mais de 1.500 m² de exposições permanentes e interativas.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Museu_da_Gente_Sergipana.jpg/1280px-Museu_da_Gente_Sergipana.jpg",
    imagemFallback: "/imagens/museu_da_gente_sergipana.jpeg",
    cor: "#287A45", emoji: "🏛️", destaque: true,
  },
  {
    id: "museu-historico",
    nome: "Museu Histórico de Sergipe",
    tipo: "material", categoria: "Museu",
    descricao: "Instalado num belíssimo sobrado colonial do século XIX em São Cristóvão, preserva documentos, objetos e pinturas que contam a história de Sergipe desde a colonização.",
    localizacao: "São Cristóvão, SE",
    curiosidade: "O museu ocupa um dos mais belos exemplares de arquitetura colonial barroca do estado, com vista para a famosa Praça São Francisco.",
    imagem: "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=800&q=80",
    imagemFallback: "/imagens/museu_da_historia_sergipana.jpeg",
    cor: "#E85D2A", emoji: "📜",
  },

  // Mercados
  {
    id: "mercado-antonio-franco",
    nome: "Mercado Antônio Franco",
    tipo: "material", categoria: "Mercado",
    descricao: "O maior e mais tradicional mercado de Aracaju, funcionando desde 1926. Reúne centenas de boxes com artesanato, temperos, ervas medicinais, redes e a famosa culinária local.",
    localizacao: "Centro, Aracaju – SE",
    curiosidade: "O mercado recebe mais de 10.000 visitantes por dia durante o Forró Caju e é parada obrigatória para quem quer conhecer o sabor autêntico de Sergipe.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Mercado_Ant%C3%B4nio_Franco_-_Aracaju_-_Sergipe_-_panoramio.jpg/1280px-Mercado_Ant%C3%B4nio_Franco_-_Aracaju_-_Sergipe_-_panoramio.jpg",
    imagemFallback: "/imagens/mercado_antonio_franco.jpeg",
    cor: "#F8C23A", emoji: "🏪", destaque: true,
  },

  // Centros Culturais
  {
    id: "centro-cultural-jackson",
    nome: "Centro Cultural Jackson de Figueiredo",
    tipo: "material", categoria: "Centro Cultural",
    descricao: "Homenagem ao grande pensador sergipano, este centro cultural abriga exposições de arte, teatro, dança e literatura, sendo um dos pilares da vida cultural de Aracaju.",
    localizacao: "Aracaju, SE",
    curiosidade: "Jackson de Figueiredo foi um filósofo e jornalista sergipano do século XX, reconhecido como um dos maiores intelectuais católicos do Brasil.",
    imagem: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
    imagemFallback: "/imagens/centro_cultural_jackson.jpeg",
    cor: "#7A2E17", emoji: "🎭",
  },

  // Arquitetura / Cidades históricas
  {
    id: "sao-cristovao",
    nome: "São Cristóvão",
    tipo: "material", categoria: "Cidade Histórica",
    descricao: "Fundada em 1590, é a 4ª cidade mais antiga do Brasil e Patrimônio Mundial da UNESCO. Seu conjunto arquitetônico colonial com igrejas barrocas e praças históricas é único.",
    localizacao: "São Cristóvão, SE",
    curiosidade: "A cidade foi a antiga capital do estado até 1855. A Praça São Francisco é tombada pela UNESCO, tornando São Cristóvão a única cidade da América com esse reconhecimento.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pra%C3%A7a_s%C3%A3o_francisco_s%C3%A3o_crist%C3%B3v%C3%A3o_sergipe.jpg/1280px-Pra%C3%A7a_s%C3%A3o_francisco_s%C3%A3o_crist%C3%B3v%C3%A3o_sergipe.jpg",
    imagemFallback: "/imagens/sao_critovam.jpeg",
    cor: "#B63822", emoji: "🏘️", destaque: true,
  },
  {
    id: "laranjeiras",
    nome: "Laranjeiras",
    tipo: "material", categoria: "Cidade Histórica",
    descricao: "Cidade tombada pelo IPHAN, Laranjeiras é um dos mais importantes centros culturais do Nordeste, berço de tradições afro-brasileiras, manifestações folclóricas e arquitetura colonial.",
    localizacao: "Laranjeiras, SE",
    curiosidade: "A cidade é conhecida como a 'Atenas Sergipana' por ter sido um importante centro intelectual e artístico no século XIX.",
    imagem: "https://images.unsplash.com/photo-1590059390047-58c5073d3e23?w=800&q=80",
    imagemFallback: "/imagens/laranjeiras.jpeg",
    cor: "#E85D2A", emoji: "🏛️",
  },

  // Monumentos / Praças
  {
    id: "passarela-caranguejo",
    nome: "Passarela do Caranguejo",
    tipo: "material", categoria: "Monumento",
    descricao: "Ícone gastronômico e turístico de Aracaju, a Passarela do Caranguejo reúne restaurantes especializados em frutos do mar, especialmente o caranguejo, símbolo da culinária sergipana.",
    localizacao: "Atalaia, Aracaju – SE",
    curiosidade: "A passarela tem 1,2 km de extensão e é visitada por mais de 5 milhões de turistas por ano, sendo o destino gastronômico mais famoso do Nordeste.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/ClevertonRibeiro_PassarelaDoCaranguejo_Aracaju_SE_%2826137163627%29.jpg/1280px-ClevertonRibeiro_PassarelaDoCaranguejo_Aracaju_SE_%2826137163627%29.jpg",
    imagemFallback: "/imagens/passarela_do_carangueijo.jpeg",
    cor: "#E85D2A", emoji: "🦀", destaque: true,
  },
  {
    id: "orla-atalaia",
    nome: "Orla de Atalaia",
    tipo: "material", categoria: "Monumento",
    descricao: "Com 6 km de extensão, a Orla de Atalaia é uma das mais belas e modernas orlas marítimas do Brasil, com pistas de caminhada, ciclovia, parques, quiosques e arte urbana.",
    localizacao: "Atalaia, Aracaju – SE",
    curiosidade: "A orla foi eleita uma das melhores praias urbanas do Brasil e recebe eventos internacionais de esportes aquáticos e festivais culturais.",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Aracaju_Orla_de_Atalaia.jpg/1280px-Aracaju_Orla_de_Atalaia.jpg",
    imagemFallback: "/imagens/orla.JPG",
    cor: "#287A45", emoji: "🌊",
  },

  // ─── IMATERIAIS ───────────────────────────────────────────────────

  // Forró
  {
    id: "forro-caju",
    nome: "Forró Caju",
    tipo: "imaterial", categoria: "Forró",
    descricao: "O Forró Caju é o maior São João urbano do Brasil, realizado em Aracaju durante o mês de junho. Atrai milhões de turistas e celebra a cultura nordestina com shows, gastronomia e tradição.",
    localizacao: "Aracaju, SE",
    curiosidade: "O festival ocupa a orla de Atalaia por 30 dias e movimenta cerca de R$200 milhões na economia local, com artistas nacionais e internacionais.",
    imagem: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
    imagemFallback: "/imagens/forro_caju.jpeg",
    cor: "#F8C23A", emoji: "🪗", destaque: true,
  },
  {
    id: "forro-pe-de-serra",
    nome: "Forró Pé-de-Serra",
    tipo: "imaterial", categoria: "Forró",
    descricao: "Raiz do forró nordestino, o pé-de-serra é tocado com sanfona, zabumba e triângulo. Surgiu no sertão e chegou às cidades carregando a alma do povo nordestino.",
    localizacao: "Todo o Nordeste",
    curiosidade: "Luiz Gonzaga, o Rei do Baião, nasceu no Pernambuco mas tornou o forró pé-de-serra conhecido em todo o Brasil, especialmente após os festivais de São João.",
    imagem: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    imagemFallback: "/imagens/forro_pe_de_serra.jpg",
    cor: "#E85D2A", emoji: "🎸",
  },

  // Vaquejada
  {
    id: "vaquejada",
    nome: "Vaquejada",
    tipo: "imaterial", categoria: "Vaquejada",
    descricao: "Esporte e tradição cultural do Nordeste, a vaquejada é uma competição onde vaqueiros a cavalo derrubam bois dentro de uma área demarcada. Em Sergipe, é patrimônio cultural do estado.",
    localizacao: "Interior de Sergipe",
    curiosidade: "Em 2017, a vaquejada foi reconhecida como patrimônio cultural imaterial do Brasil pelo IPHAN, após intenso debate nacional sobre a prática.",
    imagem: "https://images.unsplash.com/photo-1564758863248-bdc3ee3bf08e?w=800&q=80",
    imagemFallback: "/imagens/vaquejada.jpeg",
    cor: "#7A2E17", emoji: "🤠",
  },

  // Cordel
  {
    id: "literatura-cordel",
    nome: "Literatura de Cordel",
    tipo: "imaterial", categoria: "Cordel",
    descricao: "A literatura de cordel é uma tradição nordestina de folhetos impressos com xilogravuras, narrando histórias de heróis, bandidos, amor e crítica social em versos rimados.",
    localizacao: "Todo o Nordeste",
    curiosidade: "O cordel foi inscrito na lista do Patrimônio Cultural Imaterial do Brasil em 2018. Sergipe tem uma rica tradição de cordelistas que mantêm viva essa arte.",
    imagem: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
    imagemFallback: "/imagens/cordel.jpeg",
    cor: "#F8C23A", emoji: "📖", destaque: true,
  },

  // Quadrilhas
  {
    id: "quadrilhas-juninas",
    nome: "Quadrilhas Juninas",
    tipo: "imaterial", categoria: "Quadrilha",
    descricao: "As quadrilhas juninas de Sergipe são reconhecidas por sua elaboração cênica, figurinos suntuosos e coreografias complexas. Sergipe é referência nacional em quadrilhas estilizadas.",
    localizacao: "Todo o Estado",
    curiosidade: "O estado tem mais de 200 grupos de quadrilha junina ativos. O campeonato estadual reúne mais de 50.000 espectadores e é transmitido ao vivo pela TV.",
    imagem: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    imagemFallback: "/imagens/quadrilha_junina.jpeg",
    cor: "#B63822", emoji: "💃",
  },

  // Culinária
  {
    id: "culinaria-sergipana",
    nome: "Culinária Sergipana",
    tipo: "imaterial", categoria: "Culinária",
    descricao: "A culinária sergipana é uma das mais ricas do Nordeste, com destaque para o caranguejo, a moqueca de camarão, o sarrabulho, o mungunzá e as tapiocas. Uma explosão de sabores do mangue e do sertão.",
    localizacao: "Todo o Estado",
    curiosidade: "O caranguejo de Aracaju é exportado para mais de 15 países. A passarela do caranguejo serve mais de 100 toneladas do crustáceo por ano.",
    imagem: "https://images.unsplash.com/photo-1565117157-8de03d7d42f4?w=800&q=80",
    imagemFallback: "/imagens/culinaria_sergipana.jpeg",
    cor: "#E85D2A", emoji: "🦐", destaque: true,
  },

  // Artesanato
  {
    id: "artesanato-sergipano",
    nome: "Artesanato Sergipano",
    tipo: "imaterial", categoria: "Artesanato",
    descricao: "O artesanato de Sergipe inclui renda agulha, bordado, cestaria, cerâmica, couro, palha e barro. Cada região tem sua especialidade, refletindo a diversidade cultural do estado.",
    localizacao: "Todo o Estado",
    curiosidade: "A renda agulha de Divina Pastora é a única no mundo feita com a técnica de agulha única, reconhecida pelo IPHAN como patrimônio imaterial nacional.",
    imagem: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    imagemFallback: "/imagens/artesanato.jpg",
    cor: "#F8C23A", emoji: "🪡",
  },

  // Samba de Coco
  {
    id: "samba-de-coco",
    nome: "Samba de Coco",
    tipo: "imaterial", categoria: "Samba de Coco",
    descricao: "Manifestação afro-brasileira de Sergipe e Alagoas, o samba de coco é dançado em roda ao som de percussão e canto coletivo. Tradição de origem quilombola preservada até hoje.",
    localizacao: "Laranjeiras e região, SE",
    curiosidade: "O samba de coco de Sergipe foi registrado pelo IPHAN em 2014. Os grupos mais antigos remontam ao século XIX nas comunidades quilombolas do estado.",
    imagem: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&q=80",
    imagemFallback: "/imagens/samba_de_coco.jpeg",
    cor: "#287A45", emoji: "🥁",
  },

  // Reisado
  {
    id: "reisado",
    nome: "Reisado",
    tipo: "imaterial", categoria: "Reisado",
    descricao: "Festa popular de origem ibérica realizada no período natalino, o reisado reúne cantos, danças e autos teatrais que celebram os Reis Magos. Em Sergipe, tem características únicas.",
    localizacao: "Interior de Sergipe",
    curiosidade: "O reisado sergipano mistura influências indígenas, africanas e portuguesas, tornando-o único no mundo. Algumas comunidades ainda preservam instrumentos centenários.",
    imagem: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    imagemFallback: "/imagens/reisado.jpeg",
    cor: "#7A2E17", emoji: "👑",
  },

  // Festas Populares
  {
    id: "festas-populares",
    nome: "Festas Populares Sergipanas",
    tipo: "imaterial", categoria: "Festa Popular",
    descricao: "Sergipe é terra de festas! Do Bembé do Mercado em Santo Amaro das Brotas ao Encontro Cultural de Laranjeiras, o estado celebra sua diversidade com alegria, música e muita comida.",
    localizacao: "Todo o Estado",
    curiosidade: "O Encontro Cultural de Laranjeiras, realizado em janeiro, é um dos maiores festivais de cultura popular do Brasil, reunindo mais de 100 grupos folclóricos.",
    imagem: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    imagemFallback: "/imagens/festa_popular.jpeg",
    cor: "#B63822", emoji: "🎉",
  },

  // Folclore
  {
    id: "tradicoes-folcloricas",
    nome: "Tradições Folclóricas",
    tipo: "imaterial", categoria: "Folclore",
    descricao: "O folclore sergipano é rico em lendas, personagens míticos e manifestações únicas: o Lambe-Sujo e Caboclinhos de Laranjeiras, o Chegança, os Guerreiros e muitos outros.",
    localizacao: "Todo o Estado",
    curiosidade: "O Lambe-Sujo e Cabroeira é uma das manifestações folclóricas mais singulares do Brasil, exclusiva de Laranjeiras, representando o confronto entre negros fugitivos e captores.",
    imagem: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    imagemFallback: "/imagens/folclore.jpg",
    cor: "#E85D2A", emoji: "🎭", destaque: true,
  },
];

// ─── Timeline Histórica ────────────────────────────────────────────────
export type TimelineEvento = {
  ano: string;
  titulo: string;
  descricao: string;
  emoji: string;
  cor: string;
};

export const timeline: TimelineEvento[] = [
  { ano: "1575", titulo: "Fundação de São Cristóvão", descricao: "Cristóvão de Barros funda São Cristóvão, a 4ª cidade mais antiga do Brasil, às margens do Rio Paramopama.", emoji: "🏰", cor: "#F8C23A" },
  { ano: "1590", titulo: "Capitania de Sergipe", descricao: "Sergipe torna-se Capitania independente de Pernambuco, consolidando seu território e identidade.", emoji: "⚔️", cor: "#E85D2A" },
  { ano: "1820", titulo: "Elevação a Província", descricao: "Sergipe é elevado à condição de Província independente do Brasil, com capital em São Cristóvão.", emoji: "🏛️", cor: "#287A45" },
  { ano: "1855", titulo: "Nova Capital: Aracaju", descricao: "A capital é transferida de São Cristóvão para Aracaju, cidade planejada em xadrez às margens do Rio Sergipe.", emoji: "🏙️", cor: "#B63822" },
  { ano: "1889", titulo: "Estado da Federação", descricao: "Com a Proclamação da República, Sergipe torna-se Estado da Federação Brasileira.", emoji: "🇧🇷", cor: "#F8C23A" },
  { ano: "1963", titulo: "Início do Forró Nordestino", descricao: "Luiz Gonzaga populariza o forró em todo o Brasil, tornando Sergipe parte do circuito cultural nordestino.", emoji: "🪗", cor: "#E85D2A" },
  { ano: "2010", titulo: "UNESCO: Patrimônio Mundial", descricao: "A Praça São Francisco em São Cristóvão é inscrita na Lista do Patrimônio Mundial da UNESCO.", emoji: "🌍", cor: "#287A45" },
  { ano: "2011", titulo: "Museu da Gente Sergipana", descricao: "Inauguração do moderno Museu da Gente Sergipana, referência nacional em museologia interativa.", emoji: "🏛️", cor: "#7A2E17" },
  { ano: "2025", titulo: "Forró Caju Digital", descricao: "Lançamento do Sanfona de Ouro, primeira plataforma gamificada de turismo cultural do Forró Caju.", emoji: "📱", cor: "#F8C23A" },
];

// ─── Categorias para filtro ────────────────────────────────────────────
export const CATEGORIAS_MATERIAIS: PatrimonioCategoria[] = [
  "Igreja", "Museu", "Mercado", "Centro Cultural",
  "Monumento", "Arquitetura", "Cidade Histórica", "Praça",
];

export const CATEGORIAS_IMATERIAIS: PatrimonioCategoria[] = [
  "Forró", "Vaquejada", "Cordel", "Quadrilha",
  "Festa Popular", "Culinária", "Artesanato", "Samba de Coco", "Reisado", "Folclore",
];
