import { useState, useEffect } from "react";
import "./css/TradePopup.css";

const TradePopup = ({
  isOpen,
  onClose,
  selectedCards,
  onCardSelect,
  onTrade,
}) => {
  const [canTrade, setCanTrade] = useState(false);

  useEffect(() => {
    if (selectedCards.length === 3) {
      setCanTrade(isValidTrade(selectedCards));
    } else {
      setCanTrade(false);
    }
  }, [selectedCards]);

  const isValidTrade = (cards) => {
    if (cards.length !== 3) return false;

    const types = cards.map((card) => card.tipus);
    const comodines = types.filter((type) => type === "comodin").length;
    const otherTypes = types.filter((type) => type !== "comodin");

    // Si hay comodines, pueden completar cualquier combinación
    if (comodines > 0) return true;

    // Tres del mismo tipo
    if (new Set(otherTypes).size === 1) return true;

    // Tres tipos diferentes
    if (new Set(otherTypes).size === 3) return true;

    return false;
  };

  const handleTrade = () => {
    if (canTrade) {
      onTrade(selectedCards);
      onClose();
    }
  };

  const removeCard = (indexToRemove) => {
    const newSelectedCards = selectedCards.filter(
      (_, index) => index !== indexToRemove
    );
    onCardSelect(newSelectedCards);
  };

  if (!isOpen) return null;

  return (
    <div className="trade-popup-overlay" onClick={onClose}>
      <div className="trade-popup" onClick={(e) => e.stopPropagation()}>
        <div className="trade-popup-header"></div>

        <div className="trade-popup-content">
          <div className="selected-cards-area">
            <h4>Cartas Seleccionadas:</h4>
            <div className="selected-cards-grid">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="card-slot">
                  {selectedCards[index] ? (
                    <div
                      className="selected-card-item"
                      onClick={() => removeCard(index)}
                    >
                      <img
                        src={`/cards/${selectedCards[index].nom}.png`}
                        alt={selectedCards[index].nom}
                        className="popup-card-image"
                      />
                      <div className="card-details">
                        <span className="card-name">
                          {selectedCards[index].nom}
                        </span>
                        <span className="card-type">
                          {selectedCards[index].tipus}
                        </span>
                      </div>
                      <div className="remove-indicator">×</div>
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <span>Selecciona una carta</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="trade-rules">
            <h4>Reglas de Intercambio:</h4>
            <ul>
              <li>Necesitas exactamente 3 cartas</li>
              <li>3 cartas del mismo tipo</li>
              <li>3 cartas de tipos diferentes</li>
              <li>Los comodines pueden sustituir cualquier tipo</li>
            </ul>
          </div>

          {/* {selectedCards.length === 3 && (
            <div className={` ${canTrade ? "valid" : "invalid"}`}>
              {canTrade ? "✓ Combinación válida" : "✗ Combinación inválida"}
            </div>
          )} */}

          <div className="trade-popup-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className={`trade-button ${!canTrade ? "disabled" : ""}`}
              onClick={handleTrade}
              disabled={!canTrade}
            >
              Intercambiar ({selectedCards.length}/3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePopup;
