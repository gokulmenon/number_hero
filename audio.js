/* audio.js — shared Gemini TTS helper for the Number Hero variant pages.
 *
 * speakWord(word, lang): plays spoken audio for `word` via the number-hero
 * /api/audio endpoint. The endpoint URL is absolute (works from any page,
 * including under the games-hub proxy) and CORS-open. Resolves when playback
 * starts, rejects on failure — the page owns its loading/error UI.
 *
 * Plain script (no modules): include with <script src="audio.js"></script>
 * after words.js. The main index.html keeps its own inline audio logic
 * untouched.
 */
const AUDIO_API_URL = 'https://number-hero.vercel.app/api/audio';

let currentAudioEl = null;

async function speakWord(word, lang) {
    if (currentAudioEl) {
        currentAudioEl.pause();
        currentAudioEl = null;
    }

    const delays = [1000, 2000, 4000];
    let result = null;
    let attempt = 0;
    // &v=2 cache-buster, matching index.html
    const url = `${AUDIO_API_URL}?word=${encodeURIComponent(word)}&lang=${encodeURIComponent(lang)}&v=2`;

    while (attempt < 3 && !result) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                result = await response.json();
            } else {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait 60 seconds.');
                }
                throw new Error('API Request Failed');
            }
        } catch (e) {
            attempt++;
            if (attempt < 3) await new Promise(r => setTimeout(r, delays[attempt - 1]));
            else throw e;
        }
    }

    if (!result || !result.candidates || !result.candidates[0].content) {
        throw new Error('Failed to generate audio content.');
    }

    // Extract and decode PCM audio
    const base64Audio = result.candidates[0].content.parts[0].inlineData.data;
    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert to WAV and play
    const blob = createWavFile(bytes);
    const blobUrl = URL.createObjectURL(blob);
    const audioEl = new Audio();
    currentAudioEl = audioEl;
    audioEl.src = blobUrl;
    await audioEl.play();
}

// --- Helper: PCM to WAV (16-bit mono, 24kHz, matching the TTS output) ---
function createWavFile(pcmData) {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // 1 = PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byteRate
    view.setUint16(32, 2, true); // blockAlign
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const pcmView = new Uint8Array(buffer, 44);
    pcmView.set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
}
