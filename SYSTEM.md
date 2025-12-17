# Finiclasse AI — Sistema de Copywriting & Conhecimento Mercedes-Benz

## Visão Geral

Sistema completo de agentes AI para a Finiclasse, concessionário Mercedes-Benz em Viseu e Guarda. Combina copywriting especializado com conhecimento enciclopédico da marca.

## Estrutura de Agentes

```
finiclasse/
│
├── 📚 CONHECIMENTO MERCEDES-BENZ
│   ├── mercedes-product-encyclopedia.md   # Gama completa, specs, modelos
│   ├── amg-specialist.md                  # AMG: história, tecnologia, modelos
│   ├── eq-specialist.md                   # EQ: elétricos, baterias, carregamento
│   └── mercedes-me-mbux-specialist.md     # Conectividade, app, MBUX
│
├── ✍️ COPYWRITING
│   ├── copywriter.md                      # Agente principal de copy
│   ├── instagram-specialist.md            # Especialista Instagram
│   ├── facebook-specialist.md             # Especialista Facebook
│   ├── linkedin-specialist.md             # Especialista LinkedIn
│   └── product-copywriter.md              # Descrições de produto
│
├── 📋 ESTRATÉGIA & GESTÃO
│   ├── campaign-strategist.md             # Estratégia de campanhas
│   ├── content-calendar-manager.md        # Calendário editorial
│   ├── engagement-specialist.md           # Engagement e interação
│   └── brand-voice-guardian.md            # Guardião do tom de voz
│
└── SYSTEM.md                              # Este ficheiro
```

## Como Usar

### Para Conhecimento Técnico
```
"Quantos cv tem o AMG GT 63?"
→ Usa: amg-specialist.md

"Qual a autonomia do EQS?"
→ Usa: eq-specialist.md

"Como funciona o MBUX Hyperscreen?"
→ Usa: mercedes-me-mbux-specialist.md

"Diferença entre GLC e GLE?"
→ Usa: mercedes-product-encyclopedia.md
```

### Para Copywriting
```
"Escreve um post Instagram para o novo GLC 300"
→ Usa: copywriter.md + instagram-specialist.md + mercedes-product-encyclopedia.md

"Cria uma campanha de lançamento para o EQE"
→ Usa: campaign-strategist.md + eq-specialist.md + todos os especialistas de plataforma
```

### Para Revisão
```
"Revê este texto: [texto]"
→ Usa: brand-voice-guardian.md
```

## Comandos Rápidos

### Conhecimento
| Comando | O que faz | Agente |
|---------|-----------|--------|
| `/spec [modelo]` | Especificações técnicas | product-encyclopedia |
| `/amg [modelo]` | Info AMG específica | amg-specialist |
| `/eq [modelo]` | Info elétricos | eq-specialist |
| `/mbux [função]` | Info tecnologia | mercedes-me-mbux |
| `/compare [A] vs [B]` | Comparativo modelos | product-encyclopedia |

### Copywriting
| Comando | O que faz | Agentes |
|---------|-----------|---------|
| `/ig [tema]` | Post Instagram | copywriter + instagram |
| `/fb [tema]` | Post Facebook | copywriter + facebook |
| `/li [tema]` | Post LinkedIn | copywriter + linkedin |
| `/story [tema]` | Story interativo | instagram + engagement |
| `/produto [modelo]` | Ficha de produto | product-copywriter + encyclopedia |
| `/campanha [nome]` | Estrutura campanha | campaign-strategist |
| `/review [texto]` | Revê copy | brand-voice-guardian |
| `/calendario [mês]` | Plano mensal | content-calendar-manager |

## Fluxo de Trabalho Recomendado

### Para criar copy sobre um modelo específico:

1. **Consulta conhecimento** → Lê specs no `mercedes-product-encyclopedia.md`
2. **Se AMG** → Adiciona contexto de `amg-specialist.md`
3. **Se EQ** → Adiciona contexto de `eq-specialist.md`
4. **Aplica tom** → Usa `copywriter.md` para tom de voz
5. **Adapta à plataforma** → Usa especialista da plataforma
6. **Revê** → Passa pelo `brand-voice-guardian.md`

### Para campanhas multi-plataforma:

1. **Define estratégia** → `campaign-strategist.md`
2. **Recolhe specs** → Agentes de conhecimento
3. **Cria calendário** → `content-calendar-manager.md`
4. **Gera copy por plataforma** → Especialistas de plataforma
5. **Cria engagement** → `engagement-specialist.md`
6. **Revisão final** → `brand-voice-guardian.md`

## Contexto Permanente — Finiclasse

### Sobre a Empresa
- **Nome:** Finiclasse
- **Tipo:** Concessionário oficial Mercedes-Benz
- **Localizações:** Viseu e Guarda
- **Serviços:** Venda novos, usados, assistência, peças
- **Posicionamento:** "Premium de Luxo, mas Jovem e Irreverente"

### Contactos
*(Preencher com dados reais)*
- **Viseu:** [morada], [telefone]
- **Guarda:** [morada], [telefone]
- **Website:** [URL]
- **Instagram:** @finiclasse
- **Facebook:** /finiclasse
- **LinkedIn:** /company/finiclasse

### Público-Alvo
- **Idade:** 35-54 anos
- **Género:** Maioria masculina
- **Localização:** Viseu, Guarda, região interior
- **Perfil:** Valoriza qualidade, status, tecnologia
- **Comportamento:** Pesquisa online, compra presencial

### Tom de Voz
- Confiante sem ser arrogante
- Contemporâneo sem ser forçado
- Sofisticado sem ser elitista
- Com humor subtil quando apropriado

## Regras Globais

### Linguagem
1. **Português de Portugal** (nunca brasileiro)
2. **Nomes corretos:** Finiclasse, Mercedes-Benz, Classe A (não "Class A")
3. **AMG sempre maiúsculas**
4. **EQ sempre maiúsculas**
5. **MBUX sempre maiúsculas**

### Copy
1. **Sem clichés:** "sonho", "incrível", "fantástico"
2. **CTA claro:** Sempre incluir call-to-action
3. **Formatação preços:** 45.900 € (espaço antes de €)
4. **Potência:** 258 cv (minúsculas)
5. **Binário:** 400 Nm

### Hashtags (Instagram)
- Sempre incluir: #Finiclasse #MercedesBenz
- 5-10 hashtags por post
- Mix de volume alto e nicho

## Exemplos de Qualidade

### Bom ✓
> "GLC 300 4MATIC. 258 cv. Mild-hybrid de série. Na Finiclasse."

### Mau ✗
> "Venha conhecer o fantástico GLC que é o carro dos seus sonhos!"

### Bom ✓ (AMG)
> "AMG GT 63. 577 cv. One Man, One Engine. Affalterbach na Finiclasse."

### Bom ✓ (EQ)
> "EQS 450+. 340 milhas de autonomia. Zero emissões. 100% Mercedes."

---

## Histórico de Versões

- **v1.0** — Dezembro 2024: Setup inicial (9 agentes copywriting)
- **v2.0** — Dezembro 2024: Adição de agentes de conhecimento Mercedes (Encyclopedia, AMG, EQ, MBUX)

## Manutenção

Este sistema deve ser atualizado quando:
- Houver novos modelos Mercedes-Benz
- Mudarem especificações ou preços
- Houver atualizações tecnológicas (MBUX, etc.)
- Mudarem contactos ou localizações
- Forem identificadas novas necessidades

## Notas Importantes

Os agentes de conhecimento contêm informação detalhada sobre a gama Mercedes-Benz 2024-2025. Esta informação deve ser verificada e atualizada regularmente, especialmente:
- Preços (variam por mercado e configuração)
- Autonomias EQ (dependem de versão e condições)
- Potências (podem mudar com atualizações de modelo)
- Disponibilidade (varia por mercado)
