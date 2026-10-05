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
  const activeKeyObj = keyRotator.getNextActiveKey();
  if (!activeKeyObj) {
    return generateLocalStockMetadata(conceptDescription, 'Procedural Canvas');
  }

  const apiKey = activeKeyObj.key;
  const prompt = `You are a Microstock SEO Expert specializing in Adobe Stock, Shutterstock, and Freepik video contributor guidelines.
Generate high-ranking metadata for this motion graphic concept:
"${conceptDescription}"

Format your answer STRICTLY as valid JSON with no markdown wrapping:
{
  "title": "Title between 50 to 70 characters including primary keywords",
  "description": "Algorithmic description explaining aesthetics, colors, framerate, and use cases",
  "keywords": ["keyword1", "keyword2", ... 40 top relevance single and multi-word tags]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
