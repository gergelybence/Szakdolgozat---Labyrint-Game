import { useEffect, useRef, useState } from 'react';

const AIHeroController = ({ 
  labyrinthData, 
  playerPosition, 
  setPlayerPosition, 
  playerDirection, 
  setPlayerDirection, 
  hasArrow, 
  fireArrow, 
  hasTreasure, 
  width, 
  height,
  onGameEnd 
}) => {
  const visitedCells = useRef(new Set());
  const pathStack = useRef([]);
  const targetPosition = useRef(null);
  const knownWumpusPosition = useRef(null);
  const knownTreasurePosition = useRef(null);
  const aiIntervalRef = useRef(null);
  const knownMap = useRef(Array.from({ length: height }, () => Array(width).fill(null)));
  const treasureJustPickedUp = useRef(false);
  const stuckCounter = useRef(0);
  const lastPosition = useRef(null);
  const previousHasTreasure = useRef(false);
  const noMovesCounter = useRef(0);
  const treasureFound = useRef(false);
  const [gameEnded, setGameEnded] = useState(false);
  const noPathToTreasureCounter = useRef(0);
  const explorationCounter = useRef(0);
  const lastVisitedCount = useRef(0);
  const stagnantExplorationCounter = useRef(0);

  useEffect(() => {
    if (!labyrinthData || labyrinthData.length === 0) return;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (labyrinthData[row][col] !== 'path') {
          knownMap.current[row][col] = labyrinthData[row][col];
          
          if (labyrinthData[row][col] === 'wumpus') {
            knownWumpusPosition.current = { row, col };
          } else if (labyrinthData[row][col] === 'treasure') {
            knownTreasurePosition.current = { row, col };
            treasureFound.current = true;
          }
        }
      }
    }
  }, [labyrinthData, height, width]);

  useEffect(() => {
    if (hasTreasure && !previousHasTreasure.current) {
      treasureJustPickedUp.current = true;
      targetPosition.current = { row: height - 1, col: 0 };
      pathStack.current = [];
      knownTreasurePosition.current = null;
    }
    
    previousHasTreasure.current = hasTreasure;
  }, [hasTreasure, height]);

  useEffect(() => {
    if (!labyrinthData || labyrinthData.length === 0 || gameEnded) return;

    const posKey = `${playerPosition.row},${playerPosition.col}`;
    visitedCells.current.add(posKey);

    if (lastPosition.current && 
        lastPosition.current.row === playerPosition.row && 
        lastPosition.current.col === playerPosition.col) {
      stuckCounter.current++;
      
      if (stuckCounter.current > 3) {
        pathStack.current = [];
        targetPosition.current = null;
        stuckCounter.current = 0;
      }
    } else {
      stuckCounter.current = 0;
      lastPosition.current = { ...playerPosition };
    }

    if (aiIntervalRef.current) {
      clearInterval(aiIntervalRef.current);
    }

    aiIntervalRef.current = setInterval(() => {
      explorationCounter.current++;
      
      if (explorationCounter.current >= 5) {
        explorationCounter.current = 0;
        
        if (visitedCells.current.size === lastVisitedCount.current) {
          stagnantExplorationCounter.current++;
          
          if (stagnantExplorationCounter.current >= 3) {
            clearInterval(aiIntervalRef.current);
            setGameEnded(true);
            if (treasureFound.current && !hasTreasure) {
              onGameEnd("The hero found the treasure but couldn't reach it. Game over!");
            } else {
              onGameEnd("The hero couldn't find any treasure after exploring the entire labyrinth. Game over!");
            }
            return;
          }
        } else {
          stagnantExplorationCounter.current = 0;
          lastVisitedCount.current = visitedCells.current.size;
        }
        
        checkExplorationStatus();
      }
      
      if (hasTreasure && playerPosition.row === height - 1 && playerPosition.col === 0) {
        clearInterval(aiIntervalRef.current);
        onGameEnd("The hero successfully found the treasure and returned to the start! Victory!");
        return;
      }

      if (treasureJustPickedUp.current) {
        treasureJustPickedUp.current = false;
        return;
      }

      if (knownWumpusPosition.current && hasArrow) {
        const wumpusRow = knownWumpusPosition.current.row;
        const wumpusCol = knownWumpusPosition.current.col;
        
        if (playerPosition.row === wumpusRow) {
          if (wumpusCol > playerPosition.col) {
            if (playerDirection !== 'Right') {
              setPlayerDirection('Right');
              return;
            }
            fireArrow();
            knownWumpusPosition.current = null;
            return;
          } else if (wumpusCol < playerPosition.col) {
            if (playerDirection !== 'Left') {
              setPlayerDirection('Left');
              return;
            }
            fireArrow();
            knownWumpusPosition.current = null;
            return;
          }
        } else if (playerPosition.col === wumpusCol) {
          if (wumpusRow > playerPosition.row) {
            if (playerDirection !== 'Down') {
              setPlayerDirection('Down');
              return;
            }
            fireArrow();
            knownWumpusPosition.current = null;
            return;
          } else if (wumpusRow < playerPosition.row) {
            if (playerDirection !== 'Up') {
              setPlayerDirection('Up');
              return;
            }
            fireArrow();
            knownWumpusPosition.current = null;
            return;
          }
        }
      }

      if (!targetPosition.current) {
        if (!hasTreasure && knownTreasurePosition.current) {
          targetPosition.current = knownTreasurePosition.current;
        } else if (hasTreasure) {
          targetPosition.current = { row: height - 1, col: 0 };
        } else {
          targetPosition.current = findUnexploredCell();
          
          if (!targetPosition.current) {
            noMovesCounter.current++;
            
            if (noMovesCounter.current > 3) {
              clearInterval(aiIntervalRef.current);
              setGameEnded(true);
              onGameEnd("The hero couldn't find any treasure after exploring the entire labyrinth. Game over!");
              return;
            }
          }
        }
      }

      if (targetPosition.current) {
        const { row, col } = targetPosition.current;
        
        if (playerPosition.row === row && playerPosition.col === col) {
          if (!(hasTreasure && row === height - 1 && col === 0)) {
            targetPosition.current = null;
            pathStack.current = [];
          }
          return;
        }

        if (pathStack.current.length === 0) {
          const path = findPath(playerPosition, targetPosition.current);
          if (path && path.length > 0) {
            pathStack.current = path.reverse();
            noMovesCounter.current = 0;
          } else {
            if (targetPosition.current === knownTreasurePosition.current) {
              noPathToTreasureCounter.current++;
              
              if (noPathToTreasureCounter.current > 3) {
                clearInterval(aiIntervalRef.current);
                setGameEnded(true);
                onGameEnd("The hero found the treasure but couldn't reach it. Game over!");
                return;
              }
            }
            
            if (hasTreasure && targetPosition.current.row === height - 1 && targetPosition.current.col === 0) {
              exploreUnknownCells();
            } else {
              targetPosition.current = null;
            }
            return;
          }
        }

        if (pathStack.current.length > 0) {
          const nextMove = pathStack.current.pop();
          
          if (isValidCell(nextMove.row, nextMove.col)) {
            movePlayer(nextMove);
            noMovesCounter.current = 0;
          } else {
            pathStack.current = [];
          }
        }
      } else {
        const possibleMoves = getValidMoves();
        if (possibleMoves.length > 0) {
          const unvisitedMoves = possibleMoves.filter(move => 
            !visitedCells.current.has(`${move.row},${move.col}`)
          );
          
          if (unvisitedMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * unvisitedMoves.length);
            movePlayer(unvisitedMoves[randomIndex]);
            noMovesCounter.current = 0;
          } else {
            const randomIndex = Math.floor(Math.random() * possibleMoves.length);
            movePlayer(possibleMoves[randomIndex]);
            noMovesCounter.current = 0;
          }
        } else {
          updateDeadEndKnowledge();
          noMovesCounter.current++;
          
          if (noMovesCounter.current > 5) {
            clearInterval(aiIntervalRef.current);
            setGameEnded(true);
            if (treasureFound.current && !hasTreasure) {
              onGameEnd("The hero found the treasure but couldn't reach it. Game over!");
            } else {
              onGameEnd("The hero couldn't find any treasure after exploring the entire labyrinth. Game over!");
            }
            return;
          }
        }
      }
    }, 150);

    return () => {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current);
      }
    };
  }, [playerPosition, labyrinthData, hasArrow, hasTreasure, playerDirection, gameEnded, height, width, onGameEnd, fireArrow]);

  const checkExplorationStatus = () => {
    const visitedCellCount = visitedCells.current.size;
    const totalAccessibleCells = countAccessibleCells();
    const explorationThreshold = 0.7;
    
    if (visitedCellCount >= totalAccessibleCells * explorationThreshold) {
      if (!hasTreasure) {
        clearInterval(aiIntervalRef.current);
        setGameEnded(true);
        if (treasureFound.current) {
          onGameEnd("The hero found the treasure but couldn't reach it. Game over!");
        } else {
          onGameEnd("The hero couldn't find any treasure after exploring the entire labyrinth. Game over!");
        }
      }
    }
  };

  const countAccessibleCells = () => {
    let count = 0;
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (knownMap.current[row][col] !== 'wall' && knownMap.current[row][col] !== 'pit') {
          count++;
        }
      }
    }
    
    return count;
  };

  const exploreUnknownCells = () => {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (knownMap.current[row][col] === null) {
          knownMap.current[row][col] = 'path';
        }
      }
    }
  };

  const updateDeadEndKnowledge = () => {
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];

    for (const direction of directions) {
      const newRow = playerPosition.row + direction.row;
      const newCol = playerPosition.col + direction.col;
      
      if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
        if (knownMap.current[newRow][newCol] === null) {
          knownMap.current[newRow][newCol] = 'wall';
        }
      }
    }
  };

  const findUnexploredCell = () => {
    const adjacentCells = [
      { row: playerPosition.row - 1, col: playerPosition.col },
      { row: playerPosition.row + 1, col: playerPosition.col },
      { row: playerPosition.row, col: playerPosition.col - 1 },
      { row: playerPosition.row, col: playerPosition.col + 1 }
    ];

    for (const cell of adjacentCells) {
      if (isValidCell(cell.row, cell.col) && 
          !visitedCells.current.has(`${cell.row},${cell.col}`)) {
        return cell;
      }
    }

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (!visitedCells.current.has(`${row},${col}`) && 
            isValidCell(row, col)) {
          return { row, col };
        }
      }
    }

    return null;
  };

  const isValidCell = (row, col) => {
    if (row < 0 || col < 0 || row >= height || col >= width) return false;
    
    const cellType = knownMap.current[row][col];
    return cellType !== 'wall' && cellType !== 'pit';
  };

  const getValidMoves = () => {
    const moves = [];
    const directions = [
      { row: -1, col: 0, dir: 'Up' },
      { row: 1, col: 0, dir: 'Down' },
      { row: 0, col: -1, dir: 'Left' },
      { row: 0, col: 1, dir: 'Right' }
    ];

    for (const direction of directions) {
      const newRow = playerPosition.row + direction.row;
      const newCol = playerPosition.col + direction.col;
      
      if (isValidCell(newRow, newCol)) {
        moves.push({
          row: newRow,
          col: newCol,
          direction: direction.dir
        });
      }
    }

    return moves;
  };

  const movePlayer = (move) => {
    if (isValidCell(move.row, move.col)) {
      const rowDiff = Math.abs(move.row - playerPosition.row);
      const colDiff = Math.abs(move.col - playerPosition.col);
      
      if (rowDiff + colDiff === 1) {
        setPlayerDirection(move.direction);
        setPlayerPosition({ row: move.row, col: move.col });
      } else {
        pathStack.current = [];
      }
    } else {
      pathStack.current = [];
    }
  };

  const findPath = (start, target) => {
    const queue = [{ position: start, path: [] }];
    const visited = new Set();
    visited.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
      const { position, path } = queue.shift();
      
      if (position.row === target.row && position.col === target.col) {
        return path;
      }

      const directions = [
        { row: -1, col: 0, dir: 'Up' },
        { row: 1, col: 0, dir: 'Down' },
        { row: 0, col: -1, dir: 'Left' },
        { row: 0, col: 1, dir: 'Right' }
      ];

      for (const direction of directions) {
        const newRow = position.row + direction.row;
        const newCol = position.col + direction.col;
        const newPos = { row: newRow, col: newCol };
        const posKey = `${newRow},${newCol}`;

        if (isValidCell(newRow, newCol) && !visited.has(posKey)) {
          visited.add(posKey);
          const newPath = [...path, {
            row: newRow,
            col: newCol,
            direction: direction.dir
          }];
          queue.push({ position: newPos, path: newPath });
        }
      }
    }

    return null;
  };

  return null;
};

export default AIHeroController;
