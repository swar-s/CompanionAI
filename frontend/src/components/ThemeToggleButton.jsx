// ThemeToggleButton.jsx
import React from "react";

const ThemeToggleButton = () => {
  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
  };

  return <button className="theme-toggle" onClick={toggleTheme}>🌙</button>;
};

export default ThemeToggleButton;
