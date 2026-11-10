import { keyRotator } from './keyRotator';
import { buildMotionSystemPrompt, buildImageMotionUserPrompt, buildEditMotionPrompt } from './promptBuilder';
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
  userMotionPrompt?: string,
  maxRetries = 3
): Promise<GenerationResult> {
  const systemPrompt = buildMotionSystemPrompt(style, aspectRatio);
  const userPrompt = buildImageMotionUserPrompt(style, userMotionPrompt);

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
  const activeObj = keyRotator.getNextActiveKey();
  if (activeObj && activeObj.key.trim()) return activeObj.key.trim();
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (envKey) return envKey;
  return null;
}

async function executeGeminiRequestWithRotation(
  requestBody: any,
  _retriesRemaining: number
): Promise<GenerationResult> {
  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'No active Gemini API key found. Please click "API Keys" at the top to add your free Google AI Studio key.'
    };
  }

  // Primary: gemini-flash-lite-latest (verified fast & active), Fallbacks: gemini-3.5-flash-lite, gemini-3-flash-preview, gemini-3.8-flash
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  let lastErrorMessage = '';

  for (const model of candidateModels) {
    // Only Google OAuth Access tokens start with 'ya29.'. API keys (both AIzaSy... and AQ...) must use key query param or x-goog-api-key
    const isBearer = apiKey.startsWith('ya29.');
    const url = isBearer
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (isBearer) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers['x-goog-api-key'] = apiKey;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (response.status === 429) {
        keyRotator.markKeyExhausted(apiKey);
        console.warn(`Key exhausted or rate-limited (429), marked in pool. Trying next fallback model/key...`);
        continue;
      }

      if (response.status === 404 || response.status === 503 || response.status === 500) {
        // High demand, service unavailable, or model not found -> instantly try next fallback model
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
