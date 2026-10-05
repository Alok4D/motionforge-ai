import { StockMetadata } from '../../types/seo.types';
import { keyRotator } from '../gemini/keyRotator';

export function generateLocalStockMetadata(conceptTitle: string, style: string): StockMetadata {
  const baseTitle = `${conceptTitle.replace(/[^a-zA-Z0-9 ]/g, '').trim()} 4K 60FPS Seamless Loop Motion Graphic`;
  const cleanTitle = baseTitle.length > 70 ? baseTitle.substring(0, 68) + '..' : baseTitle;

  const description = `A professional high-quality procedural motion graphic footage of ${conceptTitle.toLowerCase()}. Featuring glowing paths of ${style.toLowerCase()} theme on high contrast dark backdrop. Perfect for futuristic sci-fi projects, overlay compositions, presentation background plates, and stream layouts. Seamless looped.`;

  const defaultKeywords = [
    'motion graphic', 'seamless loop', 'animated background', 'abstract art',
    'procedural animation', 'futuristic backdrop', 'glowing lines', 'modern visual',
    'vibrant graphics', 'digital rendering', 'adobe stock', 'shutterstock', 'freepik',
    'vecteezy', 'microstock footage', 'luminous glow', 'neon palette', 'contrast accents',
    'fluid motion', 'physics spiral', 'creative display', '4k 60fps', 'particle stream',
    'video overlay', 'technology background', 'sci-fi loop', 'cyber grid', 'clean design',
    'dark background', 'data visualization', 'quantum energy', 'digital indicator'
  ];

  // Extract custom words from title
  const customWords = conceptTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const combined = Array.from(new Set([...customWords, ...defaultKeywords]));

  return {
    title: cleanTitle,
    description: description,
    keywords: combined.slice(0, 45),
    synced: true
  };
}

export async function powerUpSeoWithAi(conceptDescription: string): Promise<StockMetadata> {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const activeKeyObj = keyRotator.getNextActiveKey();
  const rawKey = envKey || (activeKeyObj ? activeKeyObj.key : '');

  if (!rawKey) {
    return generateLocalStockMetadata(conceptDescription, 'Procedural Canvas');
  }

  const cleanKey = rawKey.trim();
  const isBearer = cleanKey.startsWith('AQ.') || cleanKey.startsWith('ya29.');

  try {
    const url = isBearer
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${cleanKey}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (isBearer) {
      headers['Authorization'] = `Bearer ${cleanKey}`;
    } else {
      headers['x-goog-api-key'] = cleanKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const nonThoughtParts = parts.filter((p: any) => !p.thought);
      const rawText = nonThoughtParts.length > 0 
        ? nonThoughtParts.map((p: any) => p.text || '').join('\n')
        : (parts[0]?.text || '');

      const cleanJson = rawText.replace(/```json\n?/, '').replace(/```/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title,
        description: parsed.description,
        keywords: parsed.keywords || [],
        synced: true
      };
    }
  } catch (err) {
    console.warn('AI SEO Power-Up fallback to local generator', err);
  }

  return generateLocalStockMetadata(conceptDescription, 'Procedural Canvas');
}

export function exportToStockCsv(filename: string, meta: StockMetadata): string {
  const csvHeader = 'Filename,Title,Description,Keywords,Category\n';
  const escapedTitle = `"${meta.title.replace(/"/g, '""')}"`;
  const escapedDesc = `"${meta.description.replace(/"/g, '""')}"`;
  const escapedKeywords = `"${meta.keywords.join(', ').replace(/"/g, '""')}"`;
  const category = '"Technology"';

  return csvHeader + `${filename},${escapedTitle},${escapedDesc},${escapedKeywords},${category}\n`;
}
