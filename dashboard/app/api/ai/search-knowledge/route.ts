import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, buildSystemPrompt } from '@/lib/agents';
import { generateCopy } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const encyclopedia = getAgentById('product-encyclopedia');
    if (!encyclopedia) {
      return NextResponse.json({ error: 'Product encyclopedia agent not found' }, { status: 500 });
    }

    const userPrompt = `Responde à seguinte questão sobre produtos Mercedes-Benz: "${query}"`;

    const systemPrompt = buildSystemPrompt([encyclopedia]);
    
    const result = await generateCopy({
        platform: 'instagram_feed', // dummy value
        contentType: 'novo_modelo', // dummy value
        provider: 'groq',
        additionalContext: userPrompt,
    });

    return NextResponse.json({ answer: result.content.body });

  } catch (error) {
    console.error('Knowledge search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to search knowledge base', details: errorMessage },
      { status: 500 }
    );
  }
}
