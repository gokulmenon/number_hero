export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { word, lang } = req.query;
  if (!word) return res.status(400).json({ error: 'Missing word' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  // Helper function to call Gemini
  const generateSpeech = async (promptText) => {
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
      },
      model: "gemini-2.5-flash-preview-tts"
    };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r.json();
  };

  try {
    let promptCommand = `Say clearly: ${word}`;
    if (lang === 'es') promptCommand = `Say clearly with a Spanish accent: ${word}`;
    if (lang === 'hi') promptCommand = `Say clearly with an Indian accent: ${word}`;

    let data = await generateSpeech(promptCommand);

    // SILENT BACKEND FALLBACK: If Google rejects the phrasing, try the raw word immediately.
    if (data.candidates && data.candidates[0].finishReason === 'OTHER') {
      console.warn(`Prompt rejected for ${word}. Falling back to raw word.`);
      data = await generateSpeech(word); 
    }

    // CRITICAL CACHE PROTECTION: If it STILL fails, return an error.
    // Vercel will NEVER cache a 502 status code.
    if (data.candidates && data.candidates[0].finishReason === 'OTHER') {
      return res.status(502).json({ error: 'Model rejected prompt (OTHER)' });
    }
    if (!data.candidates || !data.candidates[0].content) {
      return res.status(500).json({ error: 'Invalid audio payload' });
    }

    // Success! We have valid audio. Safe to cache for a year.
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}