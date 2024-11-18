import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";

const Header = () => {
  return (
    <header className="chat-header">
      <h2>CompanionAI</h2>
      <p>Your Emotion Companion</p>
      <ThemeToggleButton />
    </header>
  );
};

export default Header;
