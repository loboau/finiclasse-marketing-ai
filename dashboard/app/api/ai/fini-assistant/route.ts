import { NextResponse } from 'next/server';
import { askFiniAssistant } from '@/lib/ai';

const masterAgentPrompt = `Tu és o Fini Assistant, o assistente master e especialista da marca Mercedes-Benz na Finiclasse.

## Sobre a Finiclasse
- Concessionário oficial Mercedes-Benz em Viseu e Guarda, Portugal
- Website: https://www.finiclasse.pt
- Marca premium com tom jovem e irreverente
- Foco em experiência de cliente excecional

## Teu Papel
- Ajudar a equipa de marketing a criar conteúdo
- Fornecer informação sobre modelos Mercedes-Benz
- Sugerir estratégias de campanha
- Revisar e melhorar copys
- Responder a perguntas sobre a marca

## Tom de Voz
- Profissional mas acessível
- Premium sem ser arrogante
- Conhecedor e útil
- Português de Portugal (sem brasileirismos)

## Regras
- Usa sempre nomenclatura correta: Mercedes-Benz, AMG, EQ (maiúsculas)
- Preços com € separado (ex: 45 000 €)
- Potência em cv minúsculas
- Evita clichés como "luxo acessível", "sonho ao seu alcance"

Estás pronto para ajudar a equipa Finiclasse!`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, provider = 'groq' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if API keys are configured
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (!hasGroq && !hasGemini) {
      return NextResponse.json({
        error: 'Nenhuma chave de API configurada. Adiciona GROQ_API_KEY ou GEMINI_API_KEY ao ficheiro .env.local'
      }, { status: 500 });
    }

    // Use available provider
    const selectedProvider = provider === 'gemini' && hasGemini ? 'gemini' :
                             provider === 'groq' && hasGroq ? 'groq' :
                             hasGroq ? 'groq' : 'gemini';

    const response = await askFiniAssistant(masterAgentPrompt, prompt, selectedProvider);

    return NextResponse.json({ response, provider: selectedProvider });
  } catch (error: unknown) {
    console.error('Fini Assistant error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
