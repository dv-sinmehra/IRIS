// ============================================================
// IRIS — Gemini AI Integration
// Powers: advisory generation + multilingual translation
// Model: gemini-3.5-flash (Gemini API v1beta — confirmed working)
// ============================================================

export type Language = 'English' | 'हिन्दी (Hindi)' | 'తెలుగు (Telugu)' | 'বাংলা (Bengali)' | 'தமிழ் (Tamil)' | 'ગુજરાતી (Gujarati)';

export type GeminiAdvisoryRequest = {
  zone: string;
  state: string;
  audience: string;
  surgeMeters: number;
  rainfall24hMm: number;
  imdCategory: string;
  windSpeedKmh: number;
  landingWindowHours: number;
  language: Language;
  apiKey: string;
};

export type GeminiAdvisoryResponse = {
  text: string;
  error?: string;
};

export type GeminiRiskNarrativeRequest = {
  zone: string;
  state: string;
  surgeMeters: number;
  rainfall24hMm: number;
  imdCategory: string;
  exposedPopulation: number;
  historicalCyclones: string;
  apiKey: string;
};

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');
  return text;
}

// ---------------------------------------------------------------------------
// Generate a localised pre-landfall public advisory
// ---------------------------------------------------------------------------
export async function generateAdvisory(request: GeminiAdvisoryRequest): Promise<GeminiAdvisoryResponse> {
  const languageInstructions: Record<Language, string> = {
    'English': 'Write the advisory in clear, simple English suitable for coastal communities.',
    'हिन्दी (Hindi)': 'तटीय समुदायों के लिए सरल हिंदी में सलाह लिखें।',
    'తెలుగు (Telugu)': 'తీర ప్రాంత సమాజాలకు అర్థమయ్యే సరళమైన తెలుగులో సలహా రాయండి.',
    'বাংলা (Bengali)': 'উপকূলীয় সম্প্রদায়ের জন্য সহজ বাংলায় পরামর্শ লিখুন।',
    'தமிழ் (Tamil)': 'கடலோர சமூகங்களுக்கு தெளிவான தமிழில் ஆலோசனை எழுதுங்கள்.',
    'ગુજરાતી (Gujarati)': 'દરિયાકાંઠાના સમુદાયો માટે સ્પષ્ટ ગુજરાતીમાં સલાહ લખો.',
  };

  const prompt = `You are an AI assistant helping a district disaster management authority draft a pre-landfall cyclone preparedness advisory. This is for PLANNING PURPOSES ONLY — not an official government warning.

SCENARIO PARAMETERS (illustrative planning scenario):
- Location: ${request.zone}, ${request.state}
- Cyclone category: IMD ${request.imdCategory}
- Estimated wind speed: ${request.windSpeedKmh} km/h
- Storm surge planning band: ${request.surgeMeters.toFixed(1)} m
- Rainfall estimate: ${request.rainfall24hMm} mm over 24 hours
- Time to estimated landfall: ~${request.landingWindowHours} hours
- Target audience: ${request.audience}

INSTRUCTIONS:
${languageInstructions[request.language]}

Write a concise preparedness advisory (150–200 words) that:
1. States this is a PLANNING SCENARIO, not an official warning
2. Clearly explains the risk (surge, rainfall, wind) in simple terms
3. Gives 3–4 actionable steps for the specific audience
4. Mentions shelter locations, evacuation, and essential supplies
5. Directs people to official sources (IMD, local DDMA)
6. Is respectful, calm, and avoids panic language

Do not use markdown formatting. Write as plain text paragraphs.`;

  try {
    const text = await callGemini(request.apiKey, prompt);
    return { text };
  } catch (err) {
    return { text: '', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Generate an AI risk narrative summary for the overview panel
// ---------------------------------------------------------------------------
export async function generateRiskNarrative(request: GeminiRiskNarrativeRequest): Promise<GeminiAdvisoryResponse> {
  const prompt = `You are an AI risk analyst for IRIS, a coastal disaster preparedness planning tool. Analyse this cyclone scenario and provide a brief risk narrative.

SCENARIO:
- Location: ${request.zone}, ${request.state}
- IMD Category: ${request.imdCategory}
- Storm surge: ${request.surgeMeters.toFixed(1)} m
- 24-hour rainfall: ${request.rainfall24hMm} mm
- Exposed population estimate: ${request.exposedPopulation.toLocaleString('en-IN')}
- Historical cyclone precedents: ${request.historicalCyclones}

Write a 3-sentence risk narrative (80–100 words) that:
1. Contextualises the current scenario against historical precedents
2. Identifies the top 2 risk factors for this specific location
3. States the critical pre-landfall decision window

Start with "IRIS risk analysis:" and write in clear, factual English. This is an illustrative planning scenario — note that briefly. No markdown.`;

  try {
    const text = await callGemini(request.apiKey, prompt);
    return { text };
  } catch (err) {
    return { text: '', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
