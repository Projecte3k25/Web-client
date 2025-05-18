import "./css/CardDeck.css";

const CardDeck = ({ cards = [], isOpen, onCardClick, selectedCard }) => {
  return (
    <div className="card-deck-container">
      {isOpen && (
        <div className="cards-wrapper">
          {cards.map((country, index) => (
            <div
              key={index}
              className={`card ${selectedCard === index ? "selected" : ""}`}
              style={{
                animation: `slide-down 1s ease-in-out ${
                  index * 0.2
                }s backwards`,
                rotate: `${-15 + index * 15}deg`,
                zIndex: index,
              }}
              onClick={() => onCardClick(index)}
            >
              <img
                src={`/cards/${country}.png`}
                alt={country}
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
