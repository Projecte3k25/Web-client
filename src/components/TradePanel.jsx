import "./css/TradePanel.css";
import { useState, useEffect } from "react";

const VALID_SETS = [
  ["soldier", "knight", "cannon"],
  ["soldier", "soldier", "soldier"],
  ["knight", "knight", "knight"],
  ["cannon", "cannon", "cannon"],
  ["cannon", "cannon", "wild"],
  ["cannon", "knight", "wild"],
];

const isValidTrade = (selected) => {
  if (selected.length !== 3) return false;
  const types = selected.map((card) => card.type).sort();
  return VALID_SETS.some((set) => {
    const sortedSet = [...set].sort();
    return JSON.stringify(sortedSet) === JSON.stringify(types);
  });
};

const TradePanel = ({ onClose, selectedCards, toggleCard, onTrade }) => {
  const valid = isValidTrade(selectedCards);

  return (
    <div className="trade-panel">
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>

      <div className="trade-content">
        <div className="trade-info">
          <h3>Combinaciones válidas:</h3>
          <ul>
            <li>🪖 + 🛡️ + 🧨</li>
            <li>🪖 + 🪖 + 🪖</li>
            <li>🛡️ + 🛡️ + 🛡️</li>
            <li>🧨 + 🧨 + 🧨</li>
            <li>🧨 + 🧨 + 🃏</li>
            <li>🧨 + 🛡️ + 🃏</li>
          </ul>
        </div>

        <div className="selected-cards">
          {selectedCards.map((card, idx) => (
            <img
              key={idx}
              src={`/cards/${card.name}.png`}
              alt={card.name}
              onClick={() => toggleCard(card)}
              className="selected-card"
            />
          ))}
        </div>
      </div>

      <button
        className={`trade-btn ${valid ? "valid" : "invalid"}`}
        onClick={() => valid && onTrade()}
      >
        Trade
      </button>
    </div>
  );
};

export default TradePanel;
