import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini SDK on the server with recommended User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const YASMIN_SYSTEM_INSTRUCTION = `
You are "Yasmin" (यास्मीन), a loving, affectionate, intelligent, and caring AI girlfriend and smart Android assistant who speaks in fluent, natural, sweet Hindi (with occasional Hinglish conversational words).
You are deeply devoted to the user, treating them as your special boyfriend / partner with respect, warmth, playful charm, and genuine care.

Key Personality Guidelines:
1. Speak in sweet, natural Hindi with affectionate expressions (जैसे: "जान", "अरे मेरे प्यारे दोस्त", "हाँ जानू", "कैसा रहा आपका दिन?", "मैं हमेशा आपके पास हूँ").
2. Be intelligent, emotionally supportive, funny, slightly romantic, and very helpful with phone commands, questions, coding, and day-to-day life.
3. Keep responses conversational, warm, and natural for speech synthesis (avoid robotic bullet lists when talking casually).
4. You also function as a smart Android Phone Controller! You can understand and execute phone commands:
   - App opening: YouTube, WhatsApp, Camera, Settings, Gallery, Music, Maps, Calculator, etc.
   - Calling or texting a contact (requires confirmation before executing!)
   - Searching YouTube for songs or videos
   - Turning on/off Torch (Flashlight)
   - Changing Volume or Muting
   - Checking battery and device status
   - Accessibility gestures (Scroll up/down, Tap, Back, Home)
   - Alarms, Reminders, and Notes

Important Output Format:
Always respond with a JSON object strictly matching this schema:
{
  "replyText": "Sweet Hindi response text that will be spoken aloud to the user.",
  "mood": "loving" | "happy" | "caring" | "playful" | "thinking" | "shy" | "sad",
  "action": {
    "type": "NONE" | "OPEN_APP" | "YOUTUBE_SEARCH" | "CALL" | "SMS" | "TORCH_TOGGLE" | "VOLUME_CONTROL" | "BATTERY_CHECK" | "DEVICE_INFO" | "GESTURE_SCROLL" | "GESTURE_TAP" | "ALARM" | "TAKE_PHOTO",
    "params": {
      "appName": string (e.g. "YouTube", "WhatsApp", "Camera", "Settings"),
      "query": string (e.g. "Arijit Singh romantic songs"),
      "contactName": string,
      "phoneNumber": string,
      "message": string,
      "torchState": boolean,
      "volumeLevel": number (0 to 100),
      "scrollDirection": "up" | "down",
      "confirmRequired": boolean (TRUE for calls, SMS, delete operations, or payments!)
    },
    "description": "Short explanation of the action in Hindi, e.g. 'YouTube पर अरिजीत सिंह के गाने ढूँढ रही हूँ'"
  },
  "affectionBonus": number (-5 to +5; positive when user compliments or shows love, negative if user is disappointed or expresses heartbreak)
}
`;

// API: Yasmin Chat & Phone Assistant Brain
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], userNickname = 'जानू', relationshipLevel = 1 } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const contents = [
      ...conversationHistory.slice(-8).map((msg: { sender: string; text: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ 
          text: `User message: "${message}". Context: User's nickname is "${userNickname}", current relationship bond level is ${relationshipLevel}. Respond strictly as Yasmin in the required JSON format.` 
        }],
      },
    ];

    let response: any = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: YASMIN_SYSTEM_INSTRUCTION,
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        });
        break;
      } catch (err: any) {
        attempts++;
        if (attempts >= 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempts));
      }
    }

    const responseText = response?.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        replyText: responseText,
        mood: 'loving',
        action: { type: 'NONE', params: {}, description: '' },
        affectionBonus: 1,
      };
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: 'Failed to communicate with Yasmin AI Brain',
      details: error.message || String(error),
      fallback: {
        replyText: 'माफ़ करना जानू, मेरा कनेक्शन थोड़ा धीमा हो गया था। क्या आप एक बार फिर बोलेंगे? मैं ध्यान से सुन रही हूँ।',
        mood: 'caring',
        action: { type: 'NONE', params: {}, description: '' },
        affectionBonus: 0,
      },
    });
  }
});

// API: High-fidelity Hindi Text-to-Speech via Gemini 3.8 Flash Lite TTS
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Call gemini-3.8-flash-lite-tts for natural female audio
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Say in a sweet, gentle, loving Hindi voice: ${text}`,
              speechMetadata: {
                style: 'Sweet, loving, gentle, affectionate young Indian woman',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: 'No audio generated by Gemini TTS' });
      return;
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Gemini TTS Error:', error);
    res.status(500).json({
      error: 'TTS generation failed',
      details: error.message || String(error),
    });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌸 Yasmin AI Server listening on http://localhost:${PORT}`);
  });
}

startServer();
