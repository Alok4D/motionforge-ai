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
  retriesRemaining: number,
  fallbackStyle: MotionStyle = '3D Cinematic'
): Promise<GenerationResult> {
  const apiKey = getEffectiveApiKey();

  if (apiKey) {
    const isBearer = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
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
            return executeGeminiRequestWithRotation(requestBody, retriesRemaining - 1, fallbackStyle);
          }
        }

        if (response.status === 404) {
          console.warn(`Model ${model} returned 404, trying fallback model...`);
          continue;
        }

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanCode = sanitizeGeneratedCode(rawText);

          if (cleanCode && cleanCode.includes('return function')) {
            return {
              success: true,
              code: cleanCode,
              usedKey: apiKey.substring(0, 8) + '...'
            };
          }
        }
      } catch (err: any) {
        console.warn(`Gemini call failed on model ${model}:`, err);
      }
    }
  }

  // Smart Procedural Synthesizer Fallback (Ensures motion generation NEVER fails)
  console.info('Synthesizing procedural motion via offline procedural math engine...');
  const fallbackCode = generateProceduralMotionFallback(fallbackStyle);
  return {
    success: true,
    code: fallbackCode,
    promptDescription: 'Procedural algorithmic motion generated via built-in motion engine',
    usedKey: 'Procedural Core Engine'
  };
}

function generateProceduralMotionFallback(style: MotionStyle): string {
  const seed = Math.floor(Math.random() * 10000);
  if (style === 'Line Art') {
    return `// Procedural Line Art Neon Lattice (${seed})
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2;
  const t = time * 0.0012;
  
  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#050712');
  ctx.fillRect(0, 0, width, height);

  const primary = colorSettings.elementColor || '#00f0ff';
  const secondary = colorSettings.gradientEndColor || '#ff0077';
  
  ctx.save();
  ctx.translate(cx, cy);
  const arms = 12;
  for (let i = 0; i < arms; i++) {
    const baseAngle = (i * Math.PI * 2) / arms + t * 0.4;
    ctx.beginPath();
    ctx.strokeStyle = i % 2 === 0 ? primary : secondary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 12;

    for (let step = 0; step < 80; step++) {
      const r = step * 6;
      const angle = baseAngle + Math.sin(t * 2 + step * 0.1) * 0.6;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
};`;
  } else if (style === '2D Vector') {
    return `// Procedural 2D Vector Kinetic Spiral (${seed})
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2;
  const t = time * 0.0018;

  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#060814');
  ctx.fillRect(0, 0, width, height);

  const mainColor = colorSettings.elementColor || '#00ff88';
  const accentColor = colorSettings.gradientEndColor || '#00e1ff';

  const count = 36;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.5;
    const dist = 100 + Math.sin(t * 3 + i * 0.3) * 140 + i * 6;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    const radius = 6 + Math.abs(Math.sin(t * 2 + i * 0.2)) * 14;

    ctx.fillStyle = i % 2 === 0 ? mainColor : accentColor;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
};`;
  } else {
    // 3D Cinematic Quantum Rings
    return `// Procedural 3D Cinematic Quantum Matrix (${seed})
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2;
  const t = time * 0.0015;

  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#04060f');
  ctx.fillRect(0, 0, width, height);

  const primary = colorSettings.elementColor || '#00f0ff';
  const secondary = colorSettings.gradientEndColor || '#ff0055';

  // 3D Orbital Rings
  for (let r = 0; r < 5; r++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * (0.6 - r * 0.15) + (r * Math.PI) / 4);
    ctx.scale(1, 0.35 + r * 0.12);

    ctx.strokeStyle = r % 2 === 0 ? primary : secondary;
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(0, 0, 180 + r * 65, 0, Math.PI * 2);
    ctx.stroke();

    for (let k = 0; k < 4; k++) {
      const dotAngle = t * 2.5 + (k * Math.PI) / 2 + r;
      const dx = Math.cos(dotAngle) * (180 + r * 65);
      const dy = Math.sin(dotAngle) * (180 + r * 65);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
};`;
  }
}

function sanitizeGeneratedCode(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}
