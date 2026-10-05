import { keyRotator } from './keyRotator';
import { buildMotionSystemPrompt, buildEditMotionPrompt } from './promptBuilder';
import { MotionStyle, AspectRatio } from '../../types/motion.types';

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
      error: 'No active Gemini API Key found in Key Pool. Please upload or add API keys.'
    };
  }

  const apiKey = activeKeyObj.key;
  // Models list in order of performance
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 429 || response.status === 403) {
      console.warn(`Gemini API Key exhausted (Status ${response.status}). Rotating key...`);
      keyRotator.markKeyExhausted(apiKey);

      if (retriesRemaining > 0) {
        return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1);
      } else {
        return {
          success: false,
          error: 'All active Gemini API keys in pool have reached rate limits (429). Please add more keys or reset limits.'
        };
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
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
    console.error('Gemini call error:', err);
    if (retriesRemaining > 0) {
      keyRotator.markKeyExhausted(apiKey);
      return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1);
    }
    return {
      success: false,
      error: err.message || 'Failed to generate motion code.'
    };
  }
}

function sanitizeGeneratedCode(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```javascript or ``` wrappers if model included them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}
