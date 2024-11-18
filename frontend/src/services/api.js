// src/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Sends user input to the /generate endpoint and returns the AI's response.
 * @param {string} userInput - The user's input message.
 * @returns {Promise<string>} - The AI's response text.
 */
export const sendMessageToAPI = async (userInput) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput }),
    });

    if (!response.ok) {
      throw new Error('Error generating response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error in sendMessageToAPI:", error);
    throw error;
  }
};

/**
 * Sends audio data to the /transcribe endpoint for transcription.
 * @param {string} audioData - Base64 encoded audio data.
 * @returns {Promise<string>} - The transcribed text from the audio.
 */
export const transcribeAudio = async (audioData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: audioData }),
    });

    if (!response.ok) {
      throw new Error('Error transcribing audio');
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw error;
  }
};

/**
 * Sends text to the /synthesize endpoint to generate speech audio.
 * @param {string} text - The text to be converted to speech.
 * @returns {Promise<string>} - Base64 audio content of the synthesized speech.
 */
export const synthesizeSpeech = async (text) => {
  const response = await fetch(`${API_BASE_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Error synthesizing speech');
  }

  const data = await response.json();
  return data.audioContent; // Return the base64 audio content
};

