import React, { useState } from "react";
import RiskMap from "../components/RiskMap";
import GameBoard from "../components/GameBoard";
import "./css/test.css";
import BattleDiceRoller from "../components/BattleDiceRoller";
import TurnManager from "../components/TurnManager";
import LoadingScreen from "../components/LoadingScreen";
import PlayerSidebar from "../components/PlayerSidebar";
import CardDeck from "../components/CardDeck";

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
const countries = ["BRAZIL", "SIAM", "ARGENTINA", "JAPAN"];
function Test() {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const toggleDeck = () => {
    setIsDeckOpen(!isDeckOpen);
    if (isDeckOpen) {
      setSelectedCard(null);
    }
  };

  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index);
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <GameBoard>
        {/* <RiskMap
          jugadors={jugadoresDePrueba} 
          fase={"Colocacio"}
          jugadorActual={jugadorActu} 
        />
        
        <PlayerSidebar
          jugadores={jugadoresDePrueba}
          jugadorActual={jugadorActu}
        /> */}
        <TurnManager
          jugador={jugador}
          tiempoTotal={20}
          fase={"Posicionamiento"}
        />
        <div className="App">
          {/* Botón externo que controla el componente */}
          <button
            className="toggle-button"
            onClick={toggleDeck}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 20px",
              backgroundColor: "#2f855a",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontFamily: '"Space Grotesk", "Roboto", sans-serif',
              zIndex: "1000",
            }}
          >
            {isDeckOpen ? "Ocultar Cartas" : "Mostrar Cartas"}
          </button>

          <CardDeck
            cards={countries}
            isOpen={isDeckOpen}
            onCardClick={handleCardClick}
            selectedCard={selectedCard}
          />
        </div>
      </GameBoard>
    </div>
  );
}

export default Test;
