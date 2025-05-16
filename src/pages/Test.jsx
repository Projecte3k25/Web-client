import React from "react";
import RiskMap from "../components/RiskMap";
import GameBoard from "../components/GameBoard";
import "./css/test.css";
import BattleDiceRoller from "../components/BattleDiceRoller";
import TurnManager from "../components/TurnManager";
import LoadingScreen from "../components/LoadingScreen";
import PlayerSidebar from "../components/PlayerSidebar";

const jugador = {
  user: {
    id: 1,
    nom: "Kevin",
    avatar: "./unknown.jpg",
  },
  tropas: 50,
  posicio: 4,
};
const players = [
  { id: 1, nom: "kevin", avatar: "./unknown.jpg" },
  { id: 2, nom: "test", avatar: "./unknown.jpg" },
  { id: 3, nom: "hola", avatar: "./unknown.jpg" },
];
const gmnom = "GAME DE PRUEBA";
const jugadoresDePrueba = [
  {
    jugador: { id: 1, nombre: "Jugador Verde" },
    posicio: 1,
  },
  {
    jugador: { id: 2, nombre: "Jugador Azul" },
    posicio: 2,
  },
];

const jugadorActu = {
  jugador: { id: 2, nombre: "Jugador Verde" },
  posicio: 2,
};
function Test() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <GameBoard>
        {/* <LoadingScreen gameName={gmnom} players={players}></LoadingScreen> */}
        <RiskMap
          jugadors={jugadoresDePrueba} /*partida.jugadors*/
          fase={"Colocacio"} /*faseActual*/
          jugadorActual={jugadorActu} /*jugadorActual*/
        />
        <TurnManager
          jugador={jugador}
          tiempoTotal={20}
          fase={"Posicionamiento"}
        />
        <PlayerSidebar
          jugadores={jugadoresDePrueba}
          jugadorActual={jugadorActu}
        />
        {/* <BattleDiceRoller></BattleDiceRoller> */}
      </GameBoard>
    </div>
  );
}

export default Test;
