
import { GoogleGenAI } from "@google/genai";

// Always use the prescribed initialization pattern with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // AI Coach (Vision) Analysis using Gemini 3 Flash
  analyzePosture: async (base64Data: string, exercise: string, lang: string, mimeType: string = 'image/jpeg') => {
    const promptLang = lang === 'it' ? 'RISPONDI ESCLUSIVAMENTE IN ITALIANO.' : 'RESPOND EXCLUSIVELY IN ENGLISH.';
    
    const textPart = { 
      text: `${promptLang} 
      Task: Exercise Posture Analysis. 
      User-Selected Exercise Type: ${exercise}.
      
      CRITICAL INSTRUCTION:
      1. First, identify the ACTUAL exercise being performed in the media. 
      2. The VERY FIRST LINE of your response must be exactly in this format: "IDENTIFIED_EXERCISE: [Name of Exercise]"
      3. If the user is doing something else than "${exercise}", identify it and provide feedback for the ACTUAL exercise.
      
      Feedback requirements:
      - Use ## for headers like "## Key Observations" or "## Improvement Plan".
      - Use **bold text** to highlight critical technical errors or specific anatomical points.
      - Pinpoint specific technical errors or risks of injury.
      - Provide 3 actionable tips to improve form.
      - If it is a video, analyze the full range of motion from start to finish.
      Keep the tone professional, encouraging, and technical.` 
    };

    const mediaPart = { 
      inlineData: { 
        mimeType: mimeType, 
        data: base64Data 
      } 
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [mediaPart, textPart]
      }
    });
    return response.text;
  },

  // Smart Venues - Mapping with Grounding using Gemini 2.5 series
  getSmartVenues: async (location?: string, coords?: { lat: number, lng: number }, lang: string = 'en') => {
    const promptLang = lang === 'it' ? 'RISPONDI ESCLUSIVAMENTE IN ITALIANO.' : 'RESPOND EXCLUSIVELY IN ENGLISH.';
    
    let content = `${promptLang} 
      Find REAL and EXISTING public sports facilities in this area.
      - Use ## for the names of the venues.
      - Use **bold text** to emphasize sports types or key details (e.g. **Basketball**, **Free Entry**).
      Look for: basketball courts, volleyball courts, football/soccer fields, rugby pitches, tennis courts, padel courts, golf courses, bowling alleys, public outdoor gyms, skateparks, and swimming pools.
      STRICT RULES:
      1. ONLY include places where people go specifically to DO SPORTS.
      2. EXCLUDE: Zoos, generic museums, generic parks WITHOUT sports equipment.
      3. For each venue, provide a name, its sport specialty, and a brief access note.
      You MUST use the Google Maps tool to verify the existence of these places near the target.`;
    
    if (location) content += `Target location: ${location}. `;
    
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (coords) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: coords.lat,
            longitude: coords.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: config
    });
    
    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  },

  // Auto-Scouting (Video/Stat Extraction) using Gemini 3 Flash
  analyzeScouting: async (base64Image: string, lang: string) => {
    const promptLang = lang === 'it' ? 'RISPONDI ESCLUSIVAMENTE IN ITALIANO.' : 'RESPOND EXCLUSIVELY IN ENGLISH.';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `${promptLang} Extract sports highlights and performance stats from this image. 
          - Use ## for report sections (e.g. ## Stats Overview).
          - Use **bold text** for important metrics and player names.
          Formulate a professional scouting report.` }
        ]
      }
    });
    return response.text;
  },

  // General AI Chatbot using Gemini 3 Pro
  chat: async (message: string, lang: string) => {
    const systemInstruction = lang === 'it' 
      ? "Sei SportBuddy AI. Rispondi SEMPRE e SOLO in ITALIANO. Sei un esperto di sport. Usa ## per i titoli e ** per enfatizzare termini chiave."
      : "You are SportBuddy AI. ALWAYS respond ONLY in ENGLISH. You are an expert in sports. Use ## for titles and ** for highlighting key terms.";
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemInstruction
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  }
};
