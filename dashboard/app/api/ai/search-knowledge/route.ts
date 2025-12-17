import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, buildSystemPrompt } from '@/lib/agents';
import { askFiniAssistant } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 });
    }

    if (query.trim().length === 0) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    if (query.length > 2000) {
      return NextResponse.json({ error: 'Query too long (max 2000 characters)' }, { status: 400 });
    }

    const encyclopedia = getAgentById('product-encyclopedia');
    if (!encyclopedia) {
      return NextResponse.json({ error: 'Product encyclopedia agent not found' }, { status: 500 });
    }

    const systemPrompt = buildSystemPrompt([encyclopedia]);
    const userPrompt = `Responde à seguinte questão sobre produtos Mercedes-Benz: "${query}"`;

    const answer = await askFiniAssistant(
      systemPrompt,
      userPrompt,
      'groq'
    );

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Knowledge search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to search knowledge base', details: errorMessage },
      { status: 500 }
    );
  }
}
