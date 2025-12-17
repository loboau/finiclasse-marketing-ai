import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, buildSystemPrompt } from '@/lib/agents';
import { generateCopy } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, userInput } = body;

    const strategist = getAgentById('campaign-strategist');
    if (!strategist) {
      return NextResponse.json({ error: 'Campaign strategist agent not found' }, { status: 500 });
    }

    let userPrompt = '';
    switch (step) {
      case 2: // Objective
        userPrompt = `Estou a criar uma campanha e preciso de sugestões de objetivos. O nome da campanha é "${userInput.campaignName}". Sugere 3-4 objetivos claros e mensuráveis para esta campanha, com base no framework do Campaign Strategist.`;
        break;
      case 3: // Target Audience
        userPrompt = `A minha campanha chama-se "${userInput.campaignName}" e o objetivo é "${userInput.objective}". Sugere 3 perfis de público-alvo detalhados para esta campanha.`;
        break;
      case 4: // Key Message
        userPrompt = `Campanha: "${userInput.campaignName}", Objetivo: "${userInput.objective}", Público-alvo: "${userInput.targetAudience}". Sugere 3 mensagens-chave impactantes para esta campanha.`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt([strategist]);
    
    // Using the generateCopy function for now, but we might want a more generic "generate" function in the future
    const result = await generateCopy({
        platform: 'instagram_feed', // This is a dummy value, as generateCopy requires it
        contentType: 'novo_modelo', // This is a dummy value, as generateCopy requires it
        provider: 'groq',
        additionalContext: userPrompt,
    });

    // The result from generateCopy is structured for copy, we might need to adjust this
    // For now, let's assume the suggestions are in the body
    return NextResponse.json({ suggestions: result.content.body });

  } catch (error) {
    console.error('Suggestion generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: errorMessage },
      { status: 500 }
    );
  }
}
