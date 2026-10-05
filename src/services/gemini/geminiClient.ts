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

async function executeGeminiRequestWithRotation(
  requestBody: any,
  retriesRemaining: number
): Promise<GenerationResult> {
  const activeKeyObj = keyRotator.getNextActiveKey();
  if (!activeKeyObj) {
    return {
      success: false,
      error: 'No active Gemini API Key found in Key Pool. Please click "Reset Limits" or add valid API keys.'
    };
  }

  const apiKey = activeKeyObj.key.trim();
  const isBearer = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
  
  // Valid available Gemini models
  const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];

  for (const model of candidateModels) {
    const url = isBearer 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
        console.warn(`Gemini API Key rate limited (429). Rotating key...`);
        keyRotator.markKeyExhausted(apiKey);

        if (retriesRemaining > 0) {
          return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1);
        } else {
          return {
            success: false,
            error: 'All active Gemini API keys have reached quota limit (429). Click "Reset Limits" or add new keys.'
          };
        }
      }

      if (response.status === 404) {
        // Model not found for this tier, try next model in candidate list
        console.warn(`Model ${model} returned 404, trying fallback model...`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errText);
        if (response.status === 400 || response.status === 403) {
          // If key itself is invalid or expired
          keyRotator.markKeyExhausted(apiKey);
          if (retriesRemaining > 0) {
            return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1);
          }
        }
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanCode = sanitizeGeneratedCode(rawText);

      return {
        success: true,
        code: cleanCode,
        usedKey: apiKey.substring(0, 8) + '...'
      };
    } catch (err: any) {
      console.error(`Gemini call error on model ${model}:`, err);
    }
  }

  // If retries remain, try next key in pool
  if (retriesRemaining > 0) {
    keyRotator.markKeyExhausted(apiKey);
    return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1);
  }

  return {
    success: false,
    error: 'Failed to generate motion code with current API key. Please check your internet connection or verify your API key.'
  };
}

function sanitizeGeneratedCode(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}
