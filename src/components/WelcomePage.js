import React, { useState } from "react";
import "./WelcomePage.css";

const WelcomePage = ({ onNameSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    onNameSubmit(name);
  };

  return (
    <div className="welcome-box">
      <h1>Welcome to the Labyrinth Game!</h1>
      <label>
        Please Enter Your Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
      </label>
      <button onClick={handleSubmit}>Start</button>
    </div>
  );
};

export default WelcomePage;
