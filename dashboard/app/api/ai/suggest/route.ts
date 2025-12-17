import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, buildSystemPrompt } from '@/lib/agents';
import { askFiniAssistant } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, userInput } = body;

    // Validate step
    if (!step || typeof step !== 'number') {
      return NextResponse.json({ error: 'Step is required and must be a number' }, { status: 400 });
    }

    const allowedSteps = [2, 3, 4];
    if (!allowedSteps.includes(step)) {
      return NextResponse.json({ error: 'Invalid step. Allowed values: 2, 3, 4' }, { status: 400 });
    }

    // Validate userInput object
    if (!userInput || typeof userInput !== 'object') {
      return NextResponse.json({ error: 'userInput is required and must be an object' }, { status: 400 });
    }

    // Validate required fields per step
    if (step === 2) {
      if (!userInput.campaignName || typeof userInput.campaignName !== 'string' || userInput.campaignName.trim().length === 0) {
        return NextResponse.json({ error: 'campaignName is required for step 2' }, { status: 400 });
      }
    }

    if (step === 3) {
      if (!userInput.campaignName || typeof userInput.campaignName !== 'string' || userInput.campaignName.trim().length === 0) {
        return NextResponse.json({ error: 'campaignName is required for step 3' }, { status: 400 });
      }
      if (!userInput.objective || typeof userInput.objective !== 'string' || userInput.objective.trim().length === 0) {
        return NextResponse.json({ error: 'objective is required for step 3' }, { status: 400 });
      }
    }

    if (step === 4) {
      if (!userInput.campaignName || typeof userInput.campaignName !== 'string' || userInput.campaignName.trim().length === 0) {
        return NextResponse.json({ error: 'campaignName is required for step 4' }, { status: 400 });
      }
      if (!userInput.objective || typeof userInput.objective !== 'string' || userInput.objective.trim().length === 0) {
        return NextResponse.json({ error: 'objective is required for step 4' }, { status: 400 });
      }
      if (!userInput.targetAudience || typeof userInput.targetAudience !== 'string' || userInput.targetAudience.trim().length === 0) {
        return NextResponse.json({ error: 'targetAudience is required for step 4' }, { status: 400 });
      }
    }

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
    }

    const systemPrompt = buildSystemPrompt([strategist]);

    const suggestions = await askFiniAssistant(
      systemPrompt,
      userPrompt,
      'groq'
    );

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Suggestion generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: errorMessage },
      { status: 500 }
    );
  }
}
