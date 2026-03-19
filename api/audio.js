export default async function handler(req, res) {
    // 1. MUST BE A GET REQUEST FOR VERCEL CDN CACHING
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
    }
  
    // 2. Read parameters from the URL query string (now including 'fallback')
    const { word, lang, fallback } = req.query;
  
    if (!word) {
      return res.status(400).json({ error: 'Missing word parameter' });
    }
  
    // 3. Build the prompt dynamically
    let promptCommand = `Say clearly: ${word}`;
    if (lang === 'es') promptCommand = `Say clearly with a Spanish accent: ${word}`;
    if (lang === 'hi') promptCommand = `Say clearly with an Indian accent: ${word}`;
  
    // If the frontend triggers the fallback mechanism, override the prompt
    if (fallback === 'true') {
      promptCommand = `Speaker: ${word}`;
    }
  
    const payload = {
      contents: [{ parts: [{ text: promptCommand }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
      },
      model: "gemini-2.5-flash-preview-tts"
    };
  
    const apiKey = process.env.GEMINI_API_KEY; 
  
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error?.message || 'Google Audio API Error');
      }
  
      // 4. THE MAGIC LINE: Tell Vercel to cache this exact response for 1 year
      res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
  
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to generate audio' });
    }
  }