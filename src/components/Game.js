import React, { useState, useEffect } from "react";

import LabyrinthGrid from "./LabyrinthGrid";
import PlayerDirection from "./PlayerDirection";
import AIHeroController from "./AIHeroController";

const Game = ({ width, height, labyrinthType, setWidth, setHeight, onGameEnd }) => {
  const [playerPosition, setPlayerPosition] = useState({ row: height - 1, col: 0 });
  const [playerDirection, setPlayerDirection] = useState("Up");
  const [labyrinthData, setLabyrinthData] = useState([]);
  const [hasTreasure, setHasTreasure] = useState(false);
  const [hasArrow, setHasArrow] = useState(true);
  const [selectedMode, setSelectedMode] = useState("wumpus");
  const [placedWumpus, setPlacedWumpus] = useState(false);
  const [placedTreasure, setPlacedTreasure] = useState(false);
  const [placedPits, setPlacedPits] = useState(0);
  const [placedWalls, setPlacedWalls] = useState(0);
  const [labyrinthNames, setLabyrinthNames] = useState([]);
  const [showLabyrinthNames, setShowLabyrinthNames] = useState(false);

  const maxPits = Math.floor(width * height * 0.1);
  const maxWalls = Math.floor(width * height * 0.2);

  const handleAIGameEnd = (message) => {
    alert(message);
    onGameEnd();
  };
  
  const generateBlankLabyrinth = () => Array.from({ length: height }, () => Array(width).fill("path"));

  const generateRandomLabyrinth = () => {
    const grid = Array.from({ length: height }, () => Array(width).fill("path"));
    const validPositions = [];

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (!(row === height - 1 && col === 0)) {
          validPositions.push({ row, col });
        }
      }
    }

    const placeRandomElement = (type, maxCount = 1) => {
      for (let i = 0; i < maxCount && validPositions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * validPositions.length);
        const { row, col } = validPositions.splice(randomIndex, 1)[0];
        grid[row][col] = type;
      }
    };

    placeRandomElement("wall", maxWalls);
    placeRandomElement("pit", maxPits);
    placeRandomElement("treasure");
    placeRandomElement("wumpus");
    grid[height - 1][0] = "path";
    return grid;
  };

  const getVisibleLabyrinth = () => {
    if (!labyrinthData || labyrinthData.length === 0) {
      return Array.from({ length: height }, () => Array(width).fill("path"));
    }
  
    if (labyrinthType !== "ai") return labyrinthData;
  
    const visibleGrid = Array.from({ length: height }, () => 
      Array(width).fill("path")
    );
  
    const adjacentCells = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
  
    for (const [dx, dy] of adjacentCells) {
      const newRow = playerPosition.row + dx;
      const newCol = playerPosition.col + dy;
      
      if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
        visibleGrid[newRow][newCol] = labyrinthData[newRow][newCol];
      }
    }
  
    visibleGrid[height - 1][0] = labyrinthData[height - 1][0];
    
    return visibleGrid;
  };

  useEffect(() => {
    if (labyrinthType === "random" || labyrinthType === "ai") {
      setLabyrinthData(generateRandomLabyrinth());
    } else if (labyrinthType === "blank") {
      setLabyrinthData(generateBlankLabyrinth());
    }
  }, [width, height, labyrinthType]);

  const canMoveToCell = (row, col) => {
    if (row < 0 || col < 0 || row >= height || col >= width) return false;
    return labyrinthData[row][col] !== "wall";
  };

  const clearCell = (row, col) => {
    const updatedLabyrinth = [...labyrinthData];
    updatedLabyrinth[row][col] = "path";
    setLabyrinthData(updatedLabyrinth);
  };

  const handlePlayerInteraction = () => {
    const currentCell = labyrinthData[playerPosition.row][playerPosition.col];
  
    if (currentCell === "pit") {
      alert("You fell into a pit! Game Over.");
      onGameEnd();
    } else if (currentCell === "wumpus") {
      alert("The Wumpus got you! Game Over.");
      onGameEnd();
    } else if (currentCell === "treasure" && !hasTreasure) {
      alert("You picked up the treasure! Now return to the start.");
      setHasTreasure(true);
      clearCell(playerPosition.row, playerPosition.col);
    } else if (
      hasTreasure &&
      playerPosition.row === height - 1 &&
      playerPosition.col === 0
    ) {
      alert("Congratulations, you returned with the treasure! You won!");
      onGameEnd();
    }
  };

  useEffect(() => {
  if (labyrinthData.length > 0) {
    handlePlayerInteraction();
  }
}, [playerPosition, labyrinthData]);

  const fireArrow = () => {
    if (!hasArrow) {
      alert("You have no arrows left!");
      return;
    }

    let hit = false;
    const { row, col } = playerPosition;

    const directions = {
      Up: [-1, 0],
      Down: [1, 0],
      Left: [0, -1],
      Right: [0, 1],
    };

    const [dRow, dCol] = directions[playerDirection];

    for (let r = row + dRow, c = col + dCol; r >= 0 && c >= 0 && r < height && c < width; r += dRow, c += dCol) {
      if (labyrinthData[r][c] === "wumpus") {
        alert("You hit the Wumpus!");
        clearCell(r, c);
        hit = true;
        break;
      } else if (labyrinthData[r][c] === "wall") {
        break;
      }
    }

    if (!hit) {
      alert("Your arrow hit nothing!");
    }
    setHasArrow(false);
  };

  useEffect(() => {
    if (labyrinthType !== "ai") {
      const handleKeyDown = (event) => {
        let newRow = playerPosition.row;
        let newCol = playerPosition.col;

        switch (event.key) {
          case "w":
            if (canMoveToCell(newRow - 1, newCol)) newRow--;
            break;
          case "a":
            if (canMoveToCell(newRow, newCol - 1)) newCol--;
            break;
          case "s":
            if (canMoveToCell(newRow + 1, newCol)) newRow++;
            break;
          case "d":
            if (canMoveToCell(newRow, newCol + 1)) newCol++;
            break;
          case "ArrowUp":
            setPlayerDirection("Up");
            break;
          case "ArrowDown":
            setPlayerDirection("Down");
            break;
          case "ArrowLeft":
            setPlayerDirection("Left");
            break;
          case "ArrowRight":
            setPlayerDirection("Right");
            break;
          case "f":
            fireArrow();
            break;
          default:
            return;
        }
        setPlayerPosition({ row: newRow, col: newCol });
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [playerPosition, labyrinthData, playerDirection, hasArrow, labyrinthType]);

  const handleCellClick = (row, col) => {
    if (labyrinthType === "random" || labyrinthType === "ai") return;
    const currentCell = labyrinthData[row][col];
    const updatedLabyrinth = [...labyrinthData];

    if (currentCell === "path") {
      switch (selectedMode) {
        case "wumpus":
          if (!placedWumpus) {
            updatedLabyrinth[row][col] = "wumpus";
            setPlacedWumpus(true);
          } else alert("You can only place one Wumpus!");
          break;
        case "treasure":
          if (!placedTreasure) {
            updatedLabyrinth[row][col] = "treasure";
            setPlacedTreasure(true);
          } else alert("You can only place one Treasure!");
          break;
        case "pit":
          if (placedPits < maxPits) {
            updatedLabyrinth[row][col] = "pit";
            setPlacedPits(placedPits + 1);
          } else alert(`You can only place up to ${maxPits} Pits!`);
          break;
        case "wall":
          if (placedWalls < maxWalls) {
            updatedLabyrinth[row][col] = "wall";
            setPlacedWalls(placedWalls + 1);
          } else alert(`You can only place up to ${maxWalls} Walls!`);
          break;
        default:
          break;
      }
    } else 
    {
      switch (currentCell) {
        case "wumpus":
          updatedLabyrinth[row][col] = "path";
          setPlacedWumpus(false);
          break;
        case "treasure":
          updatedLabyrinth[row][col] = "path";
          setPlacedTreasure(false);
          break;
        case "pit":
          updatedLabyrinth[row][col] = "path";
          setPlacedPits(placedPits - 1);
          break;
        case "wall":
          updatedLabyrinth[row][col] = "path";
          setPlacedWalls(placedWalls - 1);
          break;
        default:
          break;
      }
    }
    setLabyrinthData(updatedLabyrinth);
  };

  const handleSave = () => {
    const labyrinthName = prompt("Enter a name for your labyrinth:");
    if (!labyrinthName) {
      alert("Labyrinth name cannot be empty!");
      return;
    }
    try {
      const savedLabyrinths = JSON.parse(localStorage.getItem("savedLabyrinths")) || {};
      savedLabyrinths[labyrinthName] = { data: labyrinthData, width, height };
      localStorage.setItem("savedLabyrinths", JSON.stringify(savedLabyrinths));
      alert(`Labyrinth "${labyrinthName}" has been saved successfully!`);
    } catch (error) {
      console.error("Error saving labyrinth:", error);
      alert("An error occurred while saving the labyrinth. Please try again.");
    }
  };

  const handleLoad = () => {
    const labyrinthName = prompt("Enter the name of the labyrinth to load:");
    if (!labyrinthName) {
      alert("Labyrinth name cannot be empty!");
      return;
    }
  
    try {
      const savedLabyrinths = JSON.parse(localStorage.getItem("savedLabyrinths")) || {};
      if (!savedLabyrinths[labyrinthName]) {
        alert(`Labyrinth "${labyrinthName}" not found!`);
        return;
      }
  
      const { data, width: savedWidth, height: savedHeight } = savedLabyrinths[labyrinthName];
  
      setWidth(savedWidth);
      setHeight(savedHeight);
  
      setTimeout(() => {
        setLabyrinthData(data);
        setPlayerPosition({ row: savedHeight - 1, col: 0 });
      }, 0);
    } catch (error) {
      console.error("Error loading labyrinth:", error);
      alert("An error occurred while loading the labyrinth. Please try again.");
    }
  };
  
  const handleShowSavedLabyrinths = () => {
    if (!showLabyrinthNames) {
      const savedLabyrinths = JSON.parse(localStorage.getItem("savedLabyrinths")) || {};
      setLabyrinthNames(Object.keys(savedLabyrinths));
    }
    setShowLabyrinthNames((prev) => !prev);
  };

  return (
    <div>
      {labyrinthType === "blank" && (
        <>
          <div className="placement-controls">
            <span
              onClick={() => setSelectedMode("wumpus")}
              className={`placement-emoji ${selectedMode === "wumpus" ? "selected" : ""}`}
            >
              👹
            </span>
            <span
              onClick={() => setSelectedMode("treasure")}
              className={`placement-emoji ${selectedMode === "treasure" ? "selected" : ""}`}
            >
              💎
            </span>
            <span
              onClick={() => setSelectedMode("pit")}
              className={`placement-emoji ${selectedMode === "pit" ? "selected" : ""}`}
            >
              🕳️
            </span>
            <span
              onClick={() => setSelectedMode("wall")}
              className={`placement-emoji ${selectedMode === "wall" ? "selected" : ""}`}
            >
              🧱
            </span>
          </div>
          
          <div className="save-load-container">
            <button onClick={handleSave}>Save Labyrinth</button>
            <button onClick={handleLoad}>Load Labyrinth</button>
            <button onClick={handleShowSavedLabyrinths}>
              {showLabyrinthNames ? "Hide Saved Labyrinths" : "Show Saved Labyrinths"}
            </button>
          </div>
        </>
      )}

      {/* Include AI controller only for AI labyrinth type */}
      {labyrinthType === "ai" && (
        <AIHeroController
          labyrinthData={getVisibleLabyrinth()}
          playerPosition={playerPosition}
          setPlayerPosition={setPlayerPosition}
          playerDirection={playerDirection}
          setPlayerDirection={setPlayerDirection}
          hasArrow={hasArrow}
          fireArrow={fireArrow}
          hasTreasure={hasTreasure}
          width={width}
          height={height}
          onGameEnd={handleAIGameEnd}
        />
      )}

      <LabyrinthGrid
        width={width}
        height={height}
        playerPosition={playerPosition}
        labyrinthData={labyrinthType === "ai" ? getVisibleLabyrinth() : labyrinthData}
        onCellClick={handleCellClick}
      />
      <PlayerDirection direction={playerDirection} />
      <div className="arrow-container">
        <div>Arrows: {hasArrow ? "1" : "0"}</div>
      </div>
      <button className="back-to-creator-button" onClick={onGameEnd}>
        Back to Creator
      </button>
      {showLabyrinthNames && labyrinthNames.length > 0 && (
        <div className="saved-labyrinths">
          <h3>Saved Labyrinths:</h3>
          <ul>
            {labyrinthNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Game;