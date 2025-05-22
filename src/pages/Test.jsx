import React, { useState } from "react";
import RiskMap from "../components/RiskMap";
import GameBoard from "../components/GameBoard";
import "./css/test.css";
import BattleDiceRoller from "../components/BattleDiceRoller";
import TurnManager from "../components/TurnManager";
import LoadingScreen from "../components/LoadingScreen";
import PlayerSidebar from "../components/PlayerSidebar";
import CardDeck from "../components/CardDeck";
import TradePopup from "../components/TradePopup"; // Asegúrate de importar TradePopup
import AnimatedCardFromDeck from "../components/AnimatedCardFromDeck";

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

const countries = [
  { nom: "INDIA", tipus: "artilleria" },
  { nom: "PERU", tipus: "infanteria" },
  { nom: "JAPAN", tipus: "caballeria" },
  { nom: "ALASKA", tipus: "artilleria" },
  { nom: "BRAZIL", tipus: "infanteria" },
  { nom: "COMODIN", tipus: "comodin" },
];

function Test() {
  const [isDeckOpen, setIsDeckOpen] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
  const [cards, setCards] = useState(countries);

  const toggleDeck = () => {
    setIsDeckOpen(!isDeckOpen);
    if (isDeckOpen) {
      setSelectedCards([]);
      setIsTradePopupOpen(false);
    }
  };

  const handleCardClick = (card, index) => {
    // Si ya tenemos 3 cartas seleccionadas y esta carta no está seleccionada, no hacer nada
    if (selectedCards.length >= 3 && !isCardAlreadySelected(card)) {
      return;
    }

    // Si la carta ya está seleccionada, la quitamos
    if (isCardAlreadySelected(card)) {
      const newSelectedCards = selectedCards.filter(
        (selectedCard) =>
          !(selectedCard.nom === card.nom && selectedCard.tipus === card.tipus)
      );
      setSelectedCards(newSelectedCards);

      // Si no quedan cartas seleccionadas, cerrar el popup
      if (newSelectedCards.length === 0) {
        setIsTradePopupOpen(false);
      }
    } else {
      // Agregar la carta a la selección
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);

      // Abrir el popup si no está abierto
      if (!isTradePopupOpen) {
        setIsTradePopupOpen(true);
      }
    }
  };

  const isCardAlreadySelected = (card) => {
    return selectedCards.some(
      (selectedCard) =>
        selectedCard.nom === card.nom && selectedCard.tipus === card.tipus
    );
  };

  const handleTrade = (tradedCards) => {
    console.log("Trade executed with cards:", tradedCards);
    alert(
      `¡Intercambio exitoso! Cartas intercambiadas: ${tradedCards
        .map((c) => c.nom)
        .join(", ")}`
    );

    // Remover las cartas intercambiadas del deck
    const remainingCards = cards.filter(
      (card) =>
        !tradedCards.some(
          (tradedCard) =>
            tradedCard.nom === card.nom && tradedCard.tipus === card.tipus
        )
    );

    setCards(remainingCards);
    setSelectedCards([]);
    setIsTradePopupOpen(false);
  };

  const closeTradePopup = () => {
    setIsTradePopupOpen(false);
    setSelectedCards([]);
  };

  const handleCardSelect = (newSelectedCards) => {
    setSelectedCards(newSelectedCards);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <GameBoard>
        {/* Componentes comentados para la prueba */}
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

        {/* <BattleDiceRoller></BattleDiceRoller> */}

        <div className="game-container">
          {/* Controles de prueba */}
          <div
            className="test-controls"
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 1001,
            }}
          >
            <button
              onClick={toggleDeck}
              style={{
                padding: "10px 20px",
                backgroundColor: "#d4af37",
                color: "#2c1810",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              {isDeckOpen ? "Cerrar Deck" : "Abrir Deck"}
            </button>
            <span
              style={{
                color: "#f4e4bc",
                background: "rgba(0,0,0,0.7)",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
            >
              Cartas: {cards.length} | Seleccionadas: {selectedCards.length}/3
            </span>
          </div>

          <CardDeck
            cards={cards}
            isOpen={isDeckOpen}
            onCardClick={handleCardClick}
            selectedCards={selectedCards}
          />

          <TradePopup
            isOpen={isTradePopupOpen}
            onClose={closeTradePopup}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            onTrade={handleTrade}
          />
        </div>

        {/* <AnimatedCardFromDeck frontImageUrl="cards/ALASKA.png" /> */}
      </GameBoard>
    </div>
  );
}

export default Test;
