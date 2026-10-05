import { keyRotator } from './keyRotator';
import { buildMotionSystemPrompt, buildEditMotionPrompt } from './promptBuilder';
import type { MotionStyle, AspectRatio } from '../../types/motion.types';

export interface GenerationResult {
  success: boolean;
  code?: string;
  promptDescription?: string;
  usedKey?: string;
  error?: string;
}

export async function generateMotionFromImage(
  imageBase64: string,
  style: MotionStyle,
  aspectRatio: AspectRatio,
  maxRetries = 3
): Promise<GenerationResult> {
  const systemPrompt = buildMotionSystemPrompt(style, aspectRatio);
  const userPrompt = `Analyze this image in detail. Extract its visual geometry, focal elements, glow colors, and theme. Generate a high-end 60FPS procedural canvas animation code recreating this concept in ${style} style for microstock video platforms.`;

  // Clean base64
  const cleanBase64 = imageBase64.includes('base64,') 
    ? imageBase64.split('base64,')[1] 
    : imageBase64;
  
  const mimeType = imageBase64.includes('image/png') 
    ? 'image/png' 
    : (imageBase64.includes('image/webp') ? 'image/webp' : 'image/jpeg');

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt + '\n\n' + userPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    }
  };

  return executeGeminiRequestWithRotation(requestBody, maxRetries);
}

export async function editCurrentMotion(
  currentCode: string,
  userInstruction: string,
  maxRetries = 3
): Promise<GenerationResult> {
  const editPrompt = buildEditMotionPrompt(currentCode, userInstruction);

  const requestBody = {
    contents: [
      {
        parts: [{ text: editPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  };

  return executeGeminiRequestWithRotation(requestBody, maxRetries);
}

export async function generateFromTextPrompt(
  promptText: string,
  style: MotionStyle,
  aspectRatio: AspectRatio,
  maxRetries = 3
): Promise<GenerationResult> {
  const systemPrompt = buildMotionSystemPrompt(style, aspectRatio);
  const requestBody = {
    contents: [
      {
        parts: [{ text: systemPrompt + '\n\nUSER PROMPT: ' + promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 4096,
    }
  };

  return executeGeminiRequestWithRotation(requestBody, maxRetries);
}

function getEffectiveApiKey(): string | null {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (envKey) return envKey;
  const activeObj = keyRotator.getNextActiveKey();
  return activeObj ? activeObj.key.trim() : null;
}

async function executeGeminiRequestWithRotation(
  requestBody: any,
  _retriesRemaining: number
): Promise<GenerationResult> {
  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'No Gemini API Key found. Please add VITE_GEMINI_API_KEY in your .env file.'
    };
  }

  // Primary: gemini-3.1-flash-lite (fast & robust), Fallbacks: gemini-flash-lite-latest, gemini-3.7-flash, gemini-3.5-flash
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.7-flash',
    'gemini-3.5-flash'
  ];
  let lastErrorMessage = '';

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 404 || response.status === 503 || response.status === 429 || response.status === 500) {
        // High demand, rate limit, or model not found -> instantly try next fallback model
        console.warn(`Model ${model} returned ${response.status}, trying fallback model...`);
        continue;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${response.status} (${response.statusText})`;
        lastErrorMessage = errMsg;
        console.error(`Gemini API Error on ${model}:`, errMsg);
        continue;
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const nonThoughtParts = parts.filter((p: any) => !p.thought);
      const rawText = nonThoughtParts.length > 0 
        ? nonThoughtParts.map((p: any) => p.text || '').join('\n')
        : (parts[0]?.text || '');

      const cleanCode = sanitizeGeneratedCode(rawText);

      if (!cleanCode) {
        return {
          success: false,
          error: 'Gemini AI returned an empty response. Please try again.'
        };
      }

      return {
        success: true,
        code: cleanCode,
        usedKey: apiKey.substring(0, 8) + '...'
      };
    } catch (err: any) {
      lastErrorMessage = err?.message || 'Network connection failed';
      console.error(`Network error calling Gemini ${model}:`, err);
    }
  }

  return {
    success: false,
    error: lastErrorMessage || 'Failed to communicate with Google Gemini API. Please check your API key.'
  };
}

export function sanitizeGeneratedCode(raw: string): string {
  let cleaned = raw.trim();
  
  // Extract code from ```javascript ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Ensure it has a return statement if it's an anonymous function
  if (/^function\s*\(/.test(cleaned) || /^\(ctx\s*,/.test(cleaned)) {
    cleaned = `return ${cleaned};`;
  }

  return cleaned;
}
