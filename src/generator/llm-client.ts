import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LlmProvider } from '../config/types.js';
import { logger } from '../utils/logger.js';

interface LlmResponse {
  hook: string;
  generated_text: string;
  hashtags?: string[];
}

/**
 * Call LLM to generate post content
 */
export async function callLlm(
  provider: LlmProvider,
  systemPrompt: string
): Promise<LlmResponse> {
  logger.info(`Calling LLM (${provider})...`);

  if (provider === 'openai') {
    return callOpenAI(systemPrompt);
  } else if (provider === 'gemini') {
    return callGemini(systemPrompt);
  }

  throw new Error(`Unknown LLM provider: ${provider}`);
}

/**
 * OpenAI API call
 */
async function callOpenAI(prompt: string): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // gpt-5.x models use max_completion_tokens instead of max_tokens
  const isNewModel = model.startsWith('gpt-5') || model.startsWith('o3') || model.startsWith('o4');

  const params: any = {
    model,
    messages: [
      {
        role: 'system',
        content: 'あなたはSNSマーケティングの専門家です。指示に従い、JSONのみを出力してください。',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  };

  if (isNewModel) {
    params.max_completion_tokens = 1000;
  } else {
    params.max_tokens = 1000;
  }

  const response = await client.chat.completions.create(params);

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');

  logger.debug(`OpenAI raw response: ${content}`);
  return parseResponse(content);
}

/**
 * Gemini API call with rate limit retry
 */
async function callGemini(prompt: string): Promise<LlmResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1000,
      responseMimeType: 'application/json',
    },
  });

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [10_000, 30_000, 60_000]; // 10s, 30s, 60s

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const content = result.response.text();

      if (!content) throw new Error('Gemini returned empty response');

      logger.debug(`Gemini raw response: ${content}`);
      return parseResponse(content);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('retryDelay');

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        logger.warn(`Gemini rate limit hit. Waiting ${delay / 1000}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Gemini: max retries exhausted');
}

/**
 * Parse LLM response JSON
 */
function parseResponse(raw: string): LlmResponse {
  try {
    // Strip markdown code block if present
    const cleaned = raw
      .replace(/^```json?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.generated_text || typeof parsed.generated_text !== 'string') {
      throw new Error('Response missing "generated_text"');
    }

    return {
      hook: parsed.hook || parsed.generated_text.split('\n')[0] || '',
      generated_text: parsed.generated_text,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.filter((h: any) => typeof h === 'string') : [],
    };
  } catch (error) {
    logger.error(`Failed to parse LLM response: ${raw}`);
    throw new Error(`LLM response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
