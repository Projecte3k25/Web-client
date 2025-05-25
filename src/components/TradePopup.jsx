import { useState, useEffect } from "react";
import "./css/TradePopup.css";

const TradePopup = ({
  isOpen,
  onClose,
  selectedCards,
  onCardSelect,
  onTrade,
  mustTrade = false, // Nueva prop para trade obligatorio
  canTrade = true, // Nueva prop para controlar si se puede hacer trade
}) => {
  const [canTradeCards, setCanTradeCards] = useState(false);

  useEffect(() => {
    if (selectedCards.length === 3) {
      setCanTradeCards(isValidTrade(selectedCards));
    } else {
      setCanTradeCards(false);
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
    if (canTrade && canTradeCards) {
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

  const handleClose = () => {
    // Si es trade obligatorio y no hay cartas suficientes seleccionadas, mostrar advertencia
    if (mustTrade && selectedCards.length < 3) {
      // No cerrar el popup
      return;
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Si es trade obligatorio, no permitir cerrar haciendo clic fuera
    if (mustTrade) {
      return;
    }
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="trade-popup-overlay" onClick={handleOverlayClick}>
      <div className="trade-popup" onClick={(e) => e.stopPropagation()}>
        <div className="trade-popup-header">
          {mustTrade && (
            <div className="mandatory-trade-warning">
              ⚠️ INTERCAMBIO OBLIGATORIO
            </div>
          )}
          {!canTrade && (
            <div className="phase-restriction-warning">
              ⚠️ Solo puedes intercambiar en la fase de Refuerzo de Tropas
            </div>
          )}
        </div>

        <div className="trade-popup-content">
          <div className="selected-cards-area">
            <h4>
              Cartas Seleccionadas:
              {mustTrade && (
                <span className="mandatory-indicator"> (Obligatorio)</span>
              )}
            </h4>
            <div className="selected-cards-grid">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="card-slot">
                  {selectedCards[index] ? (
                    <div
                      className="selected-card-item"
                      onClick={() => removeCard(index)}
                    >
                      <img
                        src={`http://${
                          import.meta.env.VITE_BACKEND_HOST_API
                        }/assets/cards/${selectedCards[index].nom}.png`}
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
              {mustTrade && (
                <li className="mandatory-rule">
                  ⚠️ Debes intercambiar porque tienes 5+ cartas
                </li>
              )}
              {!canTrade && (
                <li className="phase-restriction-rule">
                  ⚠️ Solo disponible en fase de Refuerzo de Tropas
                </li>
              )}
            </ul>
          </div>

          <div className="trade-popup-actions">
            <button
              className={`cancel-button ${mustTrade ? "disabled" : ""}`}
              onClick={handleClose}
              disabled={mustTrade}
            >
              {mustTrade ? "No puedes cancelar" : "Cancelar"}
            </button>
            <button
              className={`trade-button ${
                !canTradeCards || !canTrade ? "disabled" : ""
              } ${mustTrade ? "mandatory" : ""}`}
              onClick={handleTrade}
              disabled={!canTradeCards || !canTrade}
            >
              {!canTrade
                ? "No disponible en esta fase"
                : mustTrade
                ? "INTERCAMBIAR OBLIGATORIO"
                : "Intercambiar"}{" "}
              ({selectedCards.length}/3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePopup;
