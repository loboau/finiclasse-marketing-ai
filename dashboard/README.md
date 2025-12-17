# Finiclasse Marketing Dashboard

Central de marketing e criacao de conteudo AI para a Finiclasse, concessionario Mercedes-Benz em Viseu e Guarda.

## Funcionalidades

- **Dashboard**: Visao geral de metricas e atividade recente
- **Copy Generator**: Geracao de conteudo AI com agentes especializados Finiclasse
- **Calendario Editorial**: Planeamento e agendamento de publicacoes
- **Base de Conhecimento Mercedes**: Informacao completa sobre gama e modelos
- **Biblioteca de Campanhas**: Gestao de campanhas com analytics
- **Gestor de Media**: Centralizacao de imagens, videos e documentos

## Integracao AI

O sistema utiliza **agentes AI especializados** que conhecem:
- Tom de voz Finiclasse (premium, jovem, irreverente)
- Gama completa Mercedes-Benz 2024-2025
- Especificacoes tecnicas AMG e EQ
- Formatos especificos por plataforma (Instagram, Facebook, LinkedIn)
- Brand guidelines e regras de copy

### Providers AI Gratuitos

- **Groq** (Llama 3.3 70B) - Rapido e gratuito
- **Gemini** (Google Flash) - Alternativa gratuita

## Setup Rapido

### 1. Instalar dependencias

```bash
cd dashboard
npm install
```

### 2. Configurar API Keys

Cria um ficheiro `.env.local` na pasta `dashboard/`:

```env
# Groq - Obter em: https://console.groq.com/
GROQ_API_KEY=gsk_your_groq_api_key

# Gemini - Obter em: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Iniciar o servidor

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
dashboard/
├── app/                      # Paginas Next.js (App Router)
│   ├── api/ai/generate/     # API de geracao AI
│   ├── copy-generator/      # Gerador de copy
│   ├── calendar/            # Calendario editorial
│   ├── knowledge/           # Base de conhecimento
│   ├── campaigns/           # Biblioteca campanhas
│   └── assets/              # Gestor de media
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   └── sidebar.tsx          # Navegacao
├── lib/
│   ├── agents/              # Sistema de agentes Finiclasse
│   │   └── index.ts         # Definicoes dos agentes
│   ├── ai.ts                # Integracao Groq/Gemini
│   └── utils.ts             # Utilitarios
└── types/                   # Tipos TypeScript
```

## Agentes Disponiveis

### Conhecimento
- **Product Encyclopedia**: Gama completa Mercedes-Benz
- **AMG Specialist**: Historia, tecnologia e modelos AMG
- **EQ Specialist**: Eletricos, baterias, carregamento

### Copywriting
- **Copywriter**: Tom de voz principal Finiclasse
- **Instagram Specialist**: Feed, Stories, Reels, Carrossel
- **Facebook Specialist**: Posts, eventos, albuns
- **LinkedIn Specialist**: Comunicacao B2B e frotas

### Estrategia
- **Brand Guardian**: Validacao de brand guidelines
- **Campaign Strategist**: Planeamento de campanhas

## Stack Tecnologico

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui (Radix UI)
- **AI**: Groq SDK, Google Generative AI
- **Icons**: Lucide React

## Design System

### Cores da Marca

| Cor | Hex | Uso |
|-----|-----|-----|
| Midnight Blue | `#0B1F2A` | Background principal |
| White | `#FFFFFF` | Texto principal |
| Arrow Silver | `#A4AAAE` | Elementos secundarios |
| Graphite | `#27343C` | Borders e divisores |
| Steel | `#333F47` | Backgrounds de cards |
| AMG Red | `#CC0000` | CTAs e destaques |

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build producao
npm run build

# Iniciar producao
npm start

# Lint
npm run lint
```

## Proximos Passos

- [ ] Autenticacao (NextAuth.js)
- [ ] Base de dados (Prisma + PostgreSQL)
- [ ] Upload de assets real
- [ ] Integracao com APIs de redes sociais
- [ ] Calendario interativo
- [ ] Analytics e metricas

## Licenca

Privado - Uso interno Finiclasse
