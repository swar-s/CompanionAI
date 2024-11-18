import React from "react";
import { useNavigate } from "react-router-dom";
import "./GenderSelection.css";


const GenderSelection = ({ setGender }) => {
  const navigate = useNavigate();

  const handleGenderSelection = (gender) => {
    setGender(gender);
    navigate("/chat");
  };

  return (
    <div className="gender-selection">
      <h1>Select AI Voice Gender</h1>
      <button onClick={() => handleGenderSelection("male")}>👦 Talk to a Male</button>
      <button onClick={() => handleGenderSelection("female")}>👩 Talk to a Female</button>
    </div>
  );
};

export default GenderSelection;