import React, { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import GameControl from "./components/Game";
import "./App.css";

const App = () => {
  const [width, setWidth] = useState(""); 
  const [height, setHeight] = useState(""); 
  const [labyrinthCreated, setLabyrinthCreated] = useState(false); 
  const [labyrinthType, setLabyrinthType] = useState(""); 
  const [labyrinthData, setLabyrinthData] = useState([]); 
  const [playerName, setPlayerName] = useState(""); 
  const [nameSubmitted, setNameSubmitted] = useState(false); 

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setNameSubmitted(true);
  };

  const handleCreateBlankLabyrinth = () => {
    if (!width || !height) {
      alert("Please enter both width and height for the labyrinth.");
      return;
    }
    setLabyrinthType("blank");
    setLabyrinthData(Array.from({ length: height }, () => Array(width).fill("path")));
    setLabyrinthCreated(true);
  };

  const handleCreateRandomLabyrinth = () => {
    if (!width || !height) {
      alert("Please enter both width and height for the labyrinth.");
      return;
    }
    setLabyrinthType("random");
    setLabyrinthCreated(true);
  };

  const handleCreateAILabyrinth = () => {
    if (!width || !height) {
      alert("Please enter both width and height for the labyrinth.");
      return;
    }
    setLabyrinthType("ai");
    setLabyrinthCreated(true);
  };

  const handleBackToWelcomePage = () => {
    setNameSubmitted(false);
    setLabyrinthCreated(false);
    setLabyrinthType("");
    setWidth("");
    setHeight("");
  };

  const handleBackToCreator = () => {
    setLabyrinthCreated(false);
  };

  return (
    <div className="app">
      {!nameSubmitted && <WelcomePage onNameSubmit={handleNameSubmit} />}
      {nameSubmitted && !labyrinthCreated && (
        <div className="labyrinth-creator">
          <h1>Welcome, {playerName}!</h1>
          <h2>Labyrinth Creator</h2>
          <div className="form-container">
            <label>
              Width:
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value === "" ? "" : parseInt(e.target.value))}
                placeholder="Enter width"
              />
            </label>
            <label>
              Height:
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value === "" ? "" : parseInt(e.target.value))}
                placeholder="Enter height"
              />
            </label>
            <div className="button-container">
              <button onClick={handleCreateBlankLabyrinth}>Blank</button>
              <button onClick={handleCreateRandomLabyrinth}>Random</button>
              <button onClick={handleCreateAILabyrinth}>AI</button>
            </div>
          </div>
          <button className="back-to-welcome-button" onClick={handleBackToWelcomePage}>
            Back to Welcome Page
          </button>
        </div>
      )}
      {nameSubmitted && labyrinthCreated && (
        <div className="labyrinth-container">
          <GameControl
            width={width}
            height={height}
            setWidth={setWidth} 
            setHeight={setHeight} 
            labyrinthType={labyrinthType} 
            labyrinthData={labyrinthData} 
            onGameEnd={handleBackToCreator}
          />
        </div>
      )}
    </div>
  );
};

export default App;