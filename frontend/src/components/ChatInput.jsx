// src/components/ChatInput.jsx
import React, { useState } from "react";
import VoiceToggleButton from "./VoiceToggleButton";
import { transcribeAudio } from "../services/api";

const ChatInput = ({ addMessage, playTextToSpeech }) => {
  const [input, setInput] = useState("");

  const handleSend = async (message) => {
    if (message.trim()) {
      addMessage(message, "user");
      setInput("");

      try {
        const response = await sendMessageToAPI(message);
        const aiMessage = typeof response === "string" ? response : response.text || "Invalid response format";
        addMessage(aiMessage, "ai");
        playTextToSpeech(aiMessage); // Automatically play TTS for AI response
      } catch (error) {
        console.error("Error:", error);
        addMessage("Error generating response", "ai");
      }
    }
  };

  const handleVoiceInput = async (audioData) => {
    try {
      const transcription = await transcribeAudio(audioData);
      handleSend(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      addMessage("Error transcribing audio", "ai");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message here..."
      />
      <VoiceToggleButton onVoiceInput={handleVoiceInput} />
      <button onClick={() => handleSend(input)}>➤</button>
    </div>
  );
};

export default ChatInput;