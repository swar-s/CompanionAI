import React from "react";

const ChatOutput = ({ messages }) => {
  return (
    <div className="chat-output">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.role}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default ChatOutput;
