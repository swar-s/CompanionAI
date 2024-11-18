// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import GenderSelection from "./components/GenderSelection";
import ChatPage from "./components/ChatPage";

function App() {
  const [gender, setGender] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/gender" element={<GenderSelection setGender={setGender} />} />
        <Route path="/chat" element={<ChatPage gender={gender} />} />
      </Routes>
    </Router>
  );
}

export default App;