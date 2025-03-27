import React from "react";

const PlayerDirection = ({ direction }) => {
  return (
    <div className="player-direction">
      <h2>You're facing: {direction}</h2>
    </div>
  );
};

export default PlayerDirection;
