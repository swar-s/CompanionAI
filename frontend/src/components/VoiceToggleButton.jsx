// src/components/VoiceToggleButton.jsx
import React, { useState, useRef } from 'react';

const VoiceToggleButton = ({ onVoiceInput }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = []; // Reset audio chunks

          // Convert audioBlob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result.split(",")[1];
            onVoiceInput(base64Audio); // Send the audio data to the parent component
          };
          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Microphone access is required for voice input.");
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  return (
    <button onClick={toggleRecording} className="mic-button">
      {isRecording ? "🎙️" : "🎤"}
    </button>
  );
};

export default VoiceToggleButton;