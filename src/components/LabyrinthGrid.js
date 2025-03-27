import React, { useEffect, useState } from "react";
import "./LabyrinthGrid.css";

const LabyrinthGrid = ({ width, height, playerPosition, labyrinthData, onCellClick }) => {
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    updateCellSize();
  }, [width, height]);

  const updateCellSize = () => {
    const maxGridDimension = Math.max(width, height);
    const optimalSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) / maxGridDimension);
    setCellSize(Math.min(optimalSize, 100));
  };

  return (
    <div className="labyrinth-grid">
      {labyrinthData.map((row, rowIndex) => (
        <div key={rowIndex} className="row" style={{ display: "flex" }}>
          {row.map((cell, colIndex) => {
            const isPlayerPosition = rowIndex === playerPosition.row && colIndex === playerPosition.col;
            const isStartPosition = rowIndex === height - 1 && colIndex === 0;

            return (
              <div
                key={colIndex}
                className={`cell ${cell}`}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                onClick={() => onCellClick && onCellClick(rowIndex, colIndex)}
              >
                {isStartPosition ? (
                  <span className="start-label" style={{ fontSize: `${cellSize * 0.3}px` }}>
                    Start
                    Finish
                  </span>
                ) : isPlayerPosition ? (
                  <span className="player-label" style={{ fontSize: `${cellSize * 0.5}px` }}>
                    🤖
                  </span>
                ) : (
                  <span className={`emoji-cell ${cell}`} style={{ fontSize: `${cellSize * 0.5}px` }}>
                    {cell === "treasure" && "💎"}
                    {cell === "wumpus" && "👹"}
                    {cell === "pit" && "🕳️"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LabyrinthGrid;