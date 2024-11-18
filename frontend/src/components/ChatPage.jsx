import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';
import VoiceToggleButton from "./VoiceToggleButton";
import userAvatar from '../assets/img/user-avatar.png';
import aiAvatar from '../assets/img/ai-avatar.png';
import chatbotImage from '../assets/img/chatbot.png';

const ChatPage = (gender) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  useEffect(()=>{
    console.log(gender);
  },[])
  const messagesEndRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const addMessage = (text, role) => {
    setMessages((prev) => [...prev, { text, role }]);
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = { text: message, role: "user" };
    addMessage(userMessage.text, "user");
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: message }),
      });
      const data = await response.json();
      const aiMessage = { text: data.response, role: "ai" };
      addMessage(aiMessage.text, "ai");
      playTextToSpeech(data.response);
    } catch (error) {
      console.error("Error:", error);
      addMessage("Error generating response", "ai");
    }
  };

  const playTextToSpeech = async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, gender }), // Pass gender if required by TTS
      });
      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
    }
  };

  // Handle voice input
  const handleVoiceInput = async (audioBase64) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: audioBase64 }),
      });
      const data = await response.json();
      if (data.transcription) {
        // Use the transcribed text as the user's message
        sendMessage(data.transcription);
      } else {
        console.error("Transcription failed.");
        addMessage("Error transcribing audio", "ai");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      addMessage("Error transcribing audio", "ai");
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-page">
      {/* Left side with chatbot image */}
      <div className="chat-left">
        <img src={chatbotImage} alt="Chatbot" className="chatbot-image" />
      </div>

      {/* Right side with chat interface */}
      <div className="chat-right">
        <div className="chat-header">
          <h1>CompanionAI</h1>
          <p>Your Emotion Companion</p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <img
                src={message.role === "user" ? userAvatar : aiAvatar}
                alt={`${message.role} avatar`}
                className="avatar"
              />
              <div className="message-content">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          {/* Integrate VoiceToggleButton and pass the handleVoiceInput function */}
          <VoiceToggleButton onVoiceInput={handleVoiceInput} />
          <button className="send-button" onClick={() => sendMessage()}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;