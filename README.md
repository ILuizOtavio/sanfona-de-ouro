# 🪗 Sanfona de Ouro — Versão Final Premium

Gincana cultural gamificada do **Forró Caju** — Aracaju, Sergipe.

---

## 🚀 Rodar em 2 passos

```bash
npm install
npm run dev
```
Acesse: **http://localhost:8082**

---

## 🔑 Acessos de teste

| Perfil      | Como entrar                                | Senha       |
|-------------|--------------------------------------------|-------------|
| **Admin**   | Botão "Acessar painel" no rodapé           | `admin2025` |
| **Lojista** | "Área do Lojista" → Cadastre seu comércio  | você define |
| **Usuário** | Botão "Cadastrar"                          | você define |

---

## ✅ Funcionalidades completas

### 🗺️ Mapa Interativo (OpenStreetMap)
- Mapa real de Aracaju com 7 pontos culturais
- Pins clicáveis com detalhes de cada local
- Link direto para Google Maps
- Mapa no painel do lojista com localização do comércio

### 👤 Avatar / Foto de Perfil
- Upload de foto diretamente do celular
- Avatar colorido automático com inicial do nome
- Foto salva localmente e persiste entre sessões

### 🎴 Álbum Estilo Panini
- 10 figurinhas com raridades: Comum, Rara, Brilhante
- Cards com gradiente, brilho dourado e emoji artístico
- Modal com história completa de cada figurinha
- Sistema de troca com QR Code simulado

### 🏆 Conquistas e Medalhas
- 6 conquistas desbloqueáveis por ações reais
- Sistema de níveis (a cada 200 pontos)
- Ranking com posição do usuário em tempo real

### 💬 Chat Cultural
- Chat em tempo real entre participantes
- Avatar colorido de cada usuário
- Mensagens iniciais de demonstração
- Envio com Enter ou botão

### 🏛️ Patrimônios Históricos e Culturais
- **16 patrimônios**: materiais e imateriais
- Galeria estilo Netflix com scroll horizontal
- Filtros por tipo (Material/Imaterial) e categoria
- Busca inteligente por nome ou descrição
- Favoritos com ícone de coração
- Modal detalhado: descrição + localização + curiosidade histórica
- Timeline histórica de Sergipe (1575–2025)

### 📱 Scanner + Validação de Cupons
- Scanner simulado de QR Codes culturais
- Campo para digitar código do lojista
- Validação com feedback visual imediato
- Recompensa exibida ao validar

### 🏪 Painel do Lojista
- Gerador de QR Code / código único
- Mini-QR visual gerado automaticamente
- Mapa com localização do comércio
- Histórico de validações recebidas
- Métricas de visitantes e conversão

### 🔐 Admin Completo (admin2025)
- Dashboard com gráfico semanal e KPIs
- **Usuários**: todos os dados + senha visível
- **Lojistas**: todos os dados + senha visível
- **Validações**: tabela completa de cupons
- Busca em todas as abas
- Botão de reload para dados em tempo real

---

## 🗄️ Supabase (opcional)

Funciona 100% com localStorage. Para nuvem:

1. Copie `.env.example` para `.env`
2. Preencha com suas credenciais do Supabase
3. Cole o SQL do `.env.example` no SQL Editor

---

## 🏗️ Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS 3 · Lucide React · OpenStreetMap · Supabase

---

*Sanfona de Ouro — Hackathon Forró Caju 2025 🪗*
