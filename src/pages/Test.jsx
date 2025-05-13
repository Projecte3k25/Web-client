import React from "react";
import RiskMap from "../components/RiskMap";
import GameBoard from "../components/GameBoard";
import "./css/test.css";
import BattleDiceRoller from "../components/BattleDiceRoller";

function Test() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <GameBoard>
        {/* <RiskMap /> */}

        <BattleDiceRoller></BattleDiceRoller>
      </GameBoard>
    </div>
  );
}

export default Test;
