import React, { useEffect, useState } from "react";
import "./css/AnimatedCardFromDeck.css";

const AnimatedCardFromDeck = ({ frontImageUrl }) => {
  const [showCard, setShowCard] = useState(false);
  const [flipCard, setFlipCard] = useState(false);
  const [removeCard, setRemoveCard] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => setShowCard(true), 2000);
    const flipTimeout = setTimeout(() => setFlipCard(true), 3000);
    const removeTimeout = setTimeout(() => setRemoveCard(true), 5000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(flipTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  return (
    <div className="deck-container z-100">
      <div className="deck-wrapper">
        {/* Mazo con volumen mejorado */}
        <div className="deck-stack">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="deck-card deck-card--down"
              style={{
                left: `${i * 2}px`,
                top: `${-i * 2}px`,
                zIndex: i,
                transform: `rotateX(${15 + i * 1}deg) rotateY(-5deg) rotateZ(${
                  i * 0.5
                }deg)`,
                filter: `brightness(${1 - i * 0.02})`,
              }}
            />
          ))}
        </div>

        {/* Carta animada saliendo del mazo */}
        {showCard && (
          <div
            className={`deck-card animated-card ${
              flipCard ? "deck-card--opened" : "deck-card--down"
            } ${removeCard ? "deck-card--removed" : ""}`}
            style={{
              backgroundImage: flipCard
                ? `url(${frontImageUrl})`
                : `url(/cards/backCard.png)`,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default AnimatedCardFromDeck;
