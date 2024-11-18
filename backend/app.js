const express = require('express');
const { SpeechClient } = require('@google-cloud/speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const speechClient = new SpeechClient();
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const textToSpeechClient = new TextToSpeechClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const users = [
  {
    email: "user@example.com",
    password: "password123",
  },
];

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email);

  if (user && password === user.password) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post('/gender', async (req, res) => {
  const { gender } = req.body;
  res.json({ message: "Gender selection successful", selectedGender: gender });
});

const model = genAI.getGenerativeModel({
  model: process.env.MODEL_LANGCHAIN,
  systemInstruction: process.env.PROMPT,
});

const generationConfig = {
  temperature: 1.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 3072,
  responseMimeType: "text/plain",
};

let conversationHistory = [];

async function sendMessageWithRetry(chatSession, message, maxRetries = 5) {
  let retries = 0;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (retries < maxRetries) {
    try {
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      if (error.status === 503) {
        retries++;
        const waitTime = Math.pow(2, retries) * 1000;
        console.log(`Model is overloaded. Retrying in ${waitTime / 1000} seconds...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Service is currently unavailable. Please try again later.");
}

app.post('/generate', async (req, res) => {
  try {
    const { userInput } = req.body;

    conversationHistory.push({ role: "user", parts: [{ text: userInput }] });

    const chatSession = model.startChat({
      generationConfig,
      history: conversationHistory,
    });

    const aiResponse = await sendMessageWithRetry(chatSession, userInput);

    conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(error.status || 500).json({ error: "Error generating response" });
  }
});

app.post('/transcribe', async (req, res) => {
  try {
    const audioContent = req.body.audio;

    const request = {
      audio: { content: audioContent },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-IN',
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ transcription });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).json({ error: "Error transcribing audio" });
  }
});

app.post('/synthesize', async (req, res) => {
  try {
    const { text, gender } = req.body;
    function getVoiceConfig({gender}) {
      console.log(gender);
      if(gender=="female" || gender=="Female"){
        return { languageCode: 'en-US', name: 'en-US-Studio-O', ssmlGender: 'FEMALE' };
      }
      return { languageCode: 'en-US', name: 'en-US-Studio-Q', ssmlGender: 'MALE' };
    }
    const voiceConfig = getVoiceConfig(gender)
      

    const request = {
      input: { text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    const [response] = await textToSpeechClient.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    res.json({ audioContent });
  } catch (error) {
    console.error("Error synthesizing text to speech:", error);
    res.status(500).json({ error: "Error synthesizing text to speech" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});