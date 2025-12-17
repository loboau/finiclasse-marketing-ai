// AI Integration - Gemini (Google) and Groq (Llama)
// Free AI providers for content generation

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { selectAgentsForGeneration, buildSystemPrompt, type Agent } from './agents';

// Types
export interface GenerationOptions {
  platform: 'instagram_feed' | 'instagram_stories' | 'instagram_reels' | 'facebook' | 'linkedin';
  contentType: 'novo_modelo' | 'entrega' | 'evento' | 'promocao' | 'educativo' | 'lifestyle' | 'engagement';
  model?: string; // Mercedes model
  topic?: string;
  additionalContext?: string;
  provider?: 'gemini' | 'groq';
}

export interface GeneratedContent {
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
}

export interface GenerationResult {
  content: GeneratedContent;
  metadata: {
    provider: string;
    model: string;
    agentsUsed: string[];
  };
}

// Platform labels for prompts
const platformLabels: Record<string, string> = {
  instagram_feed: 'Instagram Feed Post',
  instagram_stories: 'Instagram Stories',
  instagram_reels: 'Instagram Reels',
  facebook: 'Facebook Post',
  linkedin: 'LinkedIn Post',
};

// Content type labels
const contentTypeLabels: Record<string, string> = {
  novo_modelo: 'Novo Modelo em Stock',
  entrega: 'Entrega de Viatura',
  evento: 'Evento/Lançamento',
  promocao: 'Promoção/Campanha',
  educativo: 'Conteúdo Educativo',
  lifestyle: 'Lifestyle/Experiência',
  engagement: 'Engagement/Interação',
};

// Build user prompt
function buildUserPrompt(options: GenerationOptions): string {
  let prompt = `Cria copy para ${platformLabels[options.platform] || options.platform}.\n`;
  prompt += `Tipo de conteúdo: ${contentTypeLabels[options.contentType] || options.contentType}.\n`;

  if (options.model) {
    prompt += `Modelo Mercedes-Benz: ${options.model}.\n`;
  }

  if (options.topic) {
    prompt += `Tema específico: ${options.topic}.\n`;
  }

  if (options.additionalContext) {
    prompt += `Contexto adicional: ${options.additionalContext}.\n`;
  }

  prompt += `
IMPORTANTE: Devolve APENAS um objeto JSON válido neste formato exato, sem texto adicional:
{
  "headline": "texto do headline/hook",
  "body": "texto principal do post",
  "cta": "call-to-action",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Não incluas markdown, explicações ou texto antes/depois do JSON.`;

  return prompt;
}

// Parse AI response to extract JSON
function parseResponse(response: string): GeneratedContent {
  try {
    // Try direct JSON parse
    const parsed = JSON.parse(response);
    return {
      headline: parsed.headline || '',
      body: parsed.body || '',
      cta: parsed.cta || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    };
  } catch {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          headline: parsed.headline || '',
          body: parsed.body || '',
          cta: parsed.cta || '',
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        };
      } catch {
        // Return raw response as body
        return {
          headline: '',
          body: response,
          cta: '',
          hashtags: [],
        };
      }
    }

    return {
      headline: '',
      body: response,
      cta: '',
      hashtags: [],
    };
  }
}

// Generate with Gemini (Google)
async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('A chave de API da Gemini (GEMINI_API_KEY) não está configurada. Por favor, adicione-a ao seu ficheiro .env');
  }

  console.log('--- Calling Gemini API ---');
  console.log('System Prompt:', systemPrompt);
  console.log('User Prompt:', userPrompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response;
    console.log('Gemini Response:', response);
    const text = response.text();
    console.log('Extracted Text:', text);

    return { text, model: 'gemini-1.5-flash' };
  } catch (error) {
    console.error('Error in generateWithGemini:', error);
    throw error;
  }
}

// Generate with Groq (Llama)
async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('A chave de API da Groq (GROQ_API_KEY) não está configurada. Por favor, adicione-a ao seu ficheiro .env');
  }

  console.log('--- Calling Groq API ---');
  console.log('System Prompt:', systemPrompt);
  console.log('User Prompt:', userPrompt);

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    console.log('Groq Response:', completion);
    const text = completion.choices[0]?.message?.content || '';
    console.log('Extracted Text:', text);

    return { text, model: 'llama-3.3-70b-versatile' };
  } catch (error) {
    console.error('Error in generateWithGroq:', error);
    throw error;
  }
}

// Main generation function
export async function generateCopy(options: GenerationOptions): Promise<GenerationResult> {
  // Select agents based on options
  const agents = selectAgentsForGeneration({
    platform: options.platform,
    contentType: options.contentType,
    model: options.model,
  });

  // Build prompts
  const systemPrompt = buildSystemPrompt(agents);
  const userPrompt = buildUserPrompt(options);

  // Choose provider (default to Groq as it's faster)
  const provider = options.provider || 'groq';

  let aiResponse: { text: string; model: string };

  try {
    if (provider === 'gemini') {
      aiResponse = await generateWithGemini(systemPrompt, userPrompt);
    } else {
      aiResponse = await generateWithGroq(systemPrompt, userPrompt);
    }
  } catch (error) {
    // Fallback to other provider
    console.error(`${provider} failed, trying fallback:`, error);
    try {
      if (provider === 'gemini') {
        aiResponse = await generateWithGroq(systemPrompt, userPrompt);
      } else {
        aiResponse = await generateWithGemini(systemPrompt, userPrompt);
      }
    } catch (fallbackError) {
      throw new Error(`Both AI providers failed: ${fallbackError}`);
    }
  }

  // Parse response
  const content = parseResponse(aiResponse.text);

  return {
    content,
    metadata: {
      provider: provider,
      model: aiResponse.model,
      agentsUsed: agents.map(a => a.name),
    },
  };
}

// Review copy with Brand Guardian
export async function reviewCopy(
  text: string,
  options?: { provider?: 'gemini' | 'groq' }
): Promise<{
  score: number;
  feedback: string;
  issues: string[];
  suggestions: string[];
}> {
  const brandGuardianPrompt = `Tu és o Brand Voice Guardian da Finiclasse.

Revê o seguinte copy e avalia:
1. Tom de voz (premium mas acessível)
2. Linguagem (português de Portugal, sem brasileirismos)
3. Nomenclatura correta (Mercedes-Benz, AMG, EQ em maiúsculas)
4. Formatação (preços com € separado, cv minúsculas)
5. Ausência de clichés proibidos

Copy para revisão:
"${text}"

Responde em JSON:
{
  "score": 0-100,
  "feedback": "resumo geral",
  "issues": ["problema1", "problema2"],
  "suggestions": ["sugestão1", "sugestão2"]
}`;

  const provider = options?.provider || 'groq';

  let response: { text: string; model: string };

  if (provider === 'gemini') {
    response = await generateWithGemini('', brandGuardianPrompt);
  } else {
    response = await generateWithGroq('', brandGuardianPrompt);
  }

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: parsed.score || 70,
        feedback: parsed.feedback || 'Revisão concluída',
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    }
  } catch {
    // Default response if parsing fails
  }

  return {
    score: 70,
    feedback: response.text,
    issues: [],
    suggestions: [],
  };
}

// Get Mercedes model information
export async function getModelInfo(
  modelName: string,
  options?: { provider?: 'gemini' | 'groq' }
): Promise<{
  name: string;
  category: string;
  specs: Record<string, string>;
  highlights: string[];
}> {
  const knowledgePrompt = `És a enciclopédia de produtos Mercedes-Benz da Finiclasse.

Fornece informação sobre o modelo: ${modelName}

Responde em JSON:
{
  "name": "nome completo do modelo",
  "category": "Compacto/SUV/Berlina/Desportivo/Elétrico",
  "specs": {
    "motor": "tipo e cilindrada",
    "potencia": "cv",
    "binario": "Nm",
    "transmissao": "tipo",
    "tracao": "tipo",
    "consumo": "l/100km ou kWh/100km",
    "preco_desde": "€"
  },
  "highlights": ["ponto forte 1", "ponto forte 2", "ponto forte 3"]
}`;

  const provider = options?.provider || 'groq';

  let response: { text: string; model: string };

  if (provider === 'gemini') {
    response = await generateWithGemini('', knowledgePrompt);
  } else {
    response = await generateWithGroq('', knowledgePrompt);
  }

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || modelName,
        category: parsed.category || 'Desconhecido',
        specs: parsed.specs || {},
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      };
    }
  } catch {
    // Default response if parsing fails
  }

  return {
    name: modelName,
    category: 'Desconhecido',
    specs: {},
    highlights: [],
  };
}

export async function askFiniAssistant(
  systemPrompt: string,
  userPrompt: string,
  provider: 'gemini' | 'groq' = 'groq'
): Promise<string> {
  let aiResponse: { text: string; model: string };

  if (provider === 'gemini') {
    try {
      aiResponse = await generateWithGemini(systemPrompt, userPrompt);
    } catch (error: any) {
      throw new Error(`Error calling Gemini API: ${error.message}`);
    }
  } else {
    try {
      aiResponse = await generateWithGroq(systemPrompt, userPrompt);
    } catch (error: any) {
      throw new Error(`Error calling Groq API: ${error.message}`);
    }
  }

  return aiResponse.text;
}
