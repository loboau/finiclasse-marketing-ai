import { NextRequest, NextResponse } from 'next/server';
import { generateCopy, type GenerationOptions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.platform || !body.contentType) {
      return NextResponse.json(
        { error: 'platform and contentType are required' },
        { status: 400 }
      );
    }

    const options: GenerationOptions = {
      platform: body.platform,
      contentType: body.contentType,
      model: body.model,
      topic: body.topic,
      additionalContext: body.additionalContext,
      provider: body.provider || 'groq',
    };

    const result = await generateCopy(options);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for API key errors
    if (errorMessage.includes('API_KEY')) {
      return NextResponse.json(
        {
          error: 'AI API key not configured',
          details: 'Please add GROQ_API_KEY or GEMINI_API_KEY to your environment variables'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate content', details: errorMessage },
      { status: 500 }
    );
  }
}
