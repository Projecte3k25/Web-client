import "./css/CardDeck.css";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const CardDeck = ({ cards = [], isOpen, onCardClick, selectedCards = [] }) => {
  const isCardSelected = (card) => {
    return selectedCards.some(
      (selectedCard) =>
        selectedCard.nom === card.nom && selectedCard.tipus === card.tipus
    );
  };

  return (
    <div className="card-deck-container left-0">
      {isOpen && (
        <div className="cards-wrapper">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card ${isCardSelected(card) ? "selected" : ""}`}
              style={{
                animation: `slide-down 1s ease-in-out ${
                  index * 0.2
                }s backwards`,
                rotate: `${-30 + index * 15}deg`,
                zIndex: index,
              }}
              onClick={() => onCardClick(card, index)}
            >
              <img
                // src={`http://${backendHost}/assets/cards/${card.nom}.png`}
                src={`./cards/${card.nom}.png`}
                alt={card.nom}
                className="card-image"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardDeck;
