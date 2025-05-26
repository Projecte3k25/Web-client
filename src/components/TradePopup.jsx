import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./css/TradePopup.css";

const TradePopup = ({
  isOpen,
  onClose,
  selectedCards,
  onCardSelect,
  onTrade,
  mustTrade = false,
  canTrade = true,
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

    if (comodines > 0) return true;
    if (new Set(otherTypes).size === 1) return true;
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
    if (mustTrade && selectedCards.length < 3) return;
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (mustTrade) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trade-popup-overlay"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="trade-popup"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="trade-popup-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {mustTrade && (
                <motion.div
                  className="mandatory-trade-warning"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ⚠️ INTERCANVI OBLIGATORI
                </motion.div>
              )}
              {!canTrade && (
                <motion.div
                  className="phase-restriction-warning"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ⚠️ Només pots intercanviar en la fase de Reforç de Tropes
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="trade-popup-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="selected-cards-area"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4>
                  Cartes Seleccionades:
                  {mustTrade && (
                    <span className="mandatory-indicator"> (Obligatori)</span>
                  )}
                </h4>
                <div className="selected-cards-grid">
                  {Array.from({ length: 3 }, (_, index) => (
                    <motion.div
                      key={index}
                      className="card-slot"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {selectedCards[index] ? (
                        <motion.div
                          className="selected-card-item"
                          onClick={() => removeCard(index)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img
                            src={`./cards/${selectedCards[index].nom}.png`}
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
                        </motion.div>
                      ) : (
                        <div className="empty-slot">
                          <span>Selecciona una carta</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="trade-rules"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h4>Regles d'Intercanvi:</h4>
                <ul>
                  <li>Necessites exactament 3 cartes</li>
                  <li>3 cartes del mateix tipus</li>
                  <li>3 cartes de tipus diferents</li>
                  <li>Els comodins poden substituir qualsevol tipus</li>
                  {mustTrade && (
                    <li className="mandatory-rule">
                      ⚠️ Has d'intercanviar perquè tens 5+ cartes
                    </li>
                  )}
                  {!canTrade && (
                    <li className="phase-restriction-rule">
                      ⚠️ Només disponible en fase de Reforç de Tropes
                    </li>
                  )}
                </ul>
              </motion.div>

              <motion.div
                className="trade-popup-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className={`cancel-button ${mustTrade ? "disabled" : ""}`}
                  onClick={handleClose}
                  disabled={mustTrade}
                  whileHover={mustTrade ? {} : { scale: 1.03 }}
                  whileTap={mustTrade ? {} : { scale: 0.98 }}
                >
                  {mustTrade ? "No puedes cancelar" : "Cancelar"}
                </motion.button>
                <motion.button
                  className={`trade-button ${
                    !canTradeCards || !canTrade ? "disabled" : ""
                  } ${mustTrade ? "mandatory" : ""}`}
                  onClick={handleTrade}
                  disabled={!canTradeCards || !canTrade}
                  whileHover={
                    !canTradeCards || !canTrade ? {} : { scale: 1.03 }
                  }
                  whileTap={!canTradeCards || !canTrade ? {} : { scale: 0.98 }}
                >
                  {!canTrade
                    ? "No disponible en aquesta fase"
                    : mustTrade
                    ? "INTERCANVIAR OBLIGATORI"
                    : "Intercanviar"}{" "}
                  ({selectedCards.length}/3)
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TradePopup;
