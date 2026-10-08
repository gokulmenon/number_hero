/* api/image.js — AI Math Game Builder: single image generation.
 *
 * POST { prompt } → { dataUri }
 * Called by the client in parallel (fan-out) for each image the generated
 * game requested. Returns a PNG data URI ready to swap into the
 * {{IMAGE:name}} placeholders.
 *
 * Public POST API, CORS-open; the Gemini key stays server-side.
 * Rate-limited: 30 images/hour/IP (a game uses ≤4).
 */

export const maxDuration = 60;

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const recent = (hits.get(ip) || []).filter((t) => t > windowStart);
  if (recent.length >= 30) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many images — please wait a bit.' });
  }

  const prompt = String(req.body?.prompt || '').trim().slice(0, 500);
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const model = process.env.GEMINI_IMAGE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  res.setHeader('Cache-Control', 'no-store');

  try {
    const body = {
      contents: [{ parts: [{ text: `Children's game art, cute cartoon flat vector style, vibrant: ${prompt}` }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    };
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      throw new Error(`Gemini ${r.status}: ${t.slice(0, 200)}`);
    }
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!imgPart) throw new Error('No image in response');
    const mime = imgPart.inlineData.mimeType || 'image/png';
    return res.status(200).json({ dataUri: `data:${mime};base64,${imgPart.inlineData.data}` });
  } catch (error) {
    console.error('image failed:', error.message);
    return res.status(502).json({ error: 'Could not paint that picture.' });
  }
}
