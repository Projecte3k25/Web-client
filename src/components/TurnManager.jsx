import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sword, ArrowsClockwise, ShieldCheck } from "phosphor-react";
import { toast } from "react-hot-toast";
import useWebSocket from "../hooks/useWebSocket";
import CardDeck from "./CardDeck";
import TradePopup from "./TradePopup";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const posicioColors = {
  1: "#00913f",
  2: "#2196F3",
  3: "#FFEB3B",
  4: "#9C27B0",
  5: "#FF9800",
  6: "#008080",
};

const faseIcons = {
  ReforçTropes: ShieldCheck,
  Atac: Sword,
  Recolocacio: ArrowsClockwise,
};

const subFases = ["ReforçTropes", "Atac", "Recolocacio"];

export default function TurnManager({
  jugador,
  tiempoTotal,
  fase,
  tropasDisponibles,
  jugadores,
  cartas,
}) {
  const posi = jugadores?.find((e) => e.jugador.id === jugador.id)?.posicio;
  const [tiempoRestante, setTiempoRestante] = useState(tiempoTotal);
  const socket = useWebSocket();
  const [myId, setMyId] = useState(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
  const [cards, setCards] = useState(cartas || []);
  const [mustTrade, setMustTrade] = useState(false);

  const color = posicioColors[posi] || "#000";
  const isMyTurn = jugador?.id === myId;
  const isSubFase = subFases.includes(fase);

  useEffect(() => {
    const profileId = parseInt(localStorage.getItem("profile"), 10);
    setMyId(profileId);
  }, []);

  useEffect(() => {
    setTiempoRestante(tiempoTotal);
    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jugador.id, tiempoTotal, fase]);

  useEffect(() => {
    if (jugador) {
      toast(`Torn del jugador: ${jugador.nom}, fase de ${fase}`, {
        duration: 2000,
        position: "top-center",
      });
    }
  }, [jugador?.id]);

  useEffect(() => {
    if (cartas) {
      setCards(cartas);
    }
  }, [cartas]);

  useEffect(() => {
    if (isMyTurn && fase === "ReforçTropes" && cards.length >= 5) {
      setMustTrade(true);
      if (!isDeckOpen) {
        setIsDeckOpen(true);
      }
      toast.error("¡Debes intercambiar cartas! Tienes 5 o más cartas.", {
        duration: 5000,
        position: "top-center",
      });
    } else {
      setMustTrade(false);
    }
  }, [jugador?.id, myId, fase, cards.length, isDeckOpen, isMyTurn]);

  const porcentaje = (tiempoRestante / tiempoTotal) * 100;
  const canTrade = fase === "ReforçTropes";

  const handleNextFase = () => {
    if (!isMyTurn) return;
    if (mustTrade) {
      toast.error(
        "Debes intercambiar cartas antes de continuar. Tienes 5 o más cartas.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
      return;
    }

    if (socket?.socket?.readyState === WebSocket.OPEN) {
      const message = {
        method: "skipFase",
        data: {},
      };
      socket.socket.send(JSON.stringify(message));
    }
  };

  const toggleDeck = () => {
    if (!isMyTurn) return;
    setIsDeckOpen(!isDeckOpen);
    if (isDeckOpen) {
      setSelectedCards([]);
      setIsTradePopupOpen(false);
    }
  };

  const handleCardClick = (card, index) => {
    if (!isMyTurn) return;
    if (selectedCards.length >= 3 && !isCardAlreadySelected(card)) return;

    if (isCardAlreadySelected(card)) {
      const newSelectedCards = selectedCards.filter(
        (selectedCard) =>
          !(selectedCard.nom === card.nom && selectedCard.tipus === card.tipus)
      );
      setSelectedCards(newSelectedCards);
      if (newSelectedCards.length === 0) {
        setIsTradePopupOpen(false);
      }
    } else {
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);
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
    if (socket?.socket?.readyState === WebSocket.OPEN) {
      const message = {
        method: "tradeCards",
        data: {
          cards: tradedCards,
        },
      };
      socket.socket.send(JSON.stringify(message));
    }

    toast.success(
      `¡Intercambio exitoso! Cartas intercambiadas: ${tradedCards
        .map((c) => c.nom)
        .join(", ")}`,
      {
        duration: 4000,
        position: "top-center",
      }
    );

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

    if (remainingCards.length < 5) {
      setMustTrade(false);
    }
  };

  const closeTradePopup = () => {
    if (mustTrade && selectedCards.length < 3) {
      toast.error("Debes seleccionar 3 cartas para intercambiar", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    setIsTradePopupOpen(false);
    setSelectedCards([]);
  };

  const handleCardSelect = (newSelectedCards) => {
    setSelectedCards(newSelectedCards);
  };

  return (
    <>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-[#2c1810]/90 border-[#8b4513] border-2 backdrop-blur-md shadow-lg rounded-xl p-4 w-52 z-60">
        <div className="text-center text-sm font-semibold text-[#d4af37] uppercase tracking-wide">
          {isSubFase ? (
            <div className="flex gap-2 scale-[0.7]">
              {subFases.map((sfase) => {
                const Icon = faseIcons[sfase];
                const active = sfase === fase;
                return (
                  <Icon
                    key={sfase}
                    size={18}
                    weight="fill"
                    color={active ? color : "#ccc"}
                    style={{ opacity: active ? 1 : 0.5 }}
                  />
                );
              })}
            </div>
          ) : (
            fase
          )}
        </div>

        {/* Barra de tiempo */}
        <div className="relative w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full transition-all duration-300"
            style={{ width: `${porcentaje}%`, background: color }}
          />
        </div>

        {/* Info del jugador */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={`http://${backendHost}${jugador.avatar}`}
              alt={jugador.nom}
              className="w-12 h-12 rounded-full border-2"
              style={{ borderColor: color }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-[#d4af37]">{jugador.nom}</span>
              <span className="text-sm text-[#f4e4bc]/60">
                Tropas: {tropasDisponibles}
              </span>
            </div>
          </div>

          {/* Botón de cartas */}
          {isSubFase && (
            <div className="flex flex-col items-center gap-1 relative group">
              <button
                className={`rounded-md transition ${
                  isMyTurn
                    ? `hover:bg-gray-200 cursor-pointer ${
                        isDeckOpen ? "bg-gray-200" : ""
                      } ${mustTrade ? "animate-pulse bg-red-200" : ""}`
                    : "cursor-not-allowed opacity-60"
                }`}
                disabled={!cards?.length || !isMyTurn}
                onClick={toggleDeck}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="30"
                  height="30"
                  className={`transition-all ${
                    cards?.length > 0 && isMyTurn
                      ? "grayscale-0"
                      : "grayscale opacity-40"
                  } ${mustTrade ? "drop-shadow-lg" : ""}`}
                >
                  <path d="M12 8h40v48H12z" opacity="0.3" />
                  <path
                    d="M10 6h44v52H10z"
                    stroke={mustTrade ? "#dc2626" : "#000"}
                    strokeWidth="2"
                    fill={mustTrade ? "#fca5a5" : "#d4af37"}
                  />
                  <path d="M20 12h24v8H20z" fill="#2c1810" />
                  <circle cx="32" cy="40" r="6" fill="#2c1810" />
                </svg>
              </button>

              <span
                className={`text-[10px] font-medium ${
                  mustTrade ? "text-red-400 animate-pulse" : "text-[#f4e4bc]/60"
                }`}
              >
                {isMyTurn ? cards?.length || 0 : "?"}
              </span>

              <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 px-2 py-1 bg-yellow-100 text-black text-[10px] rounded shadow border border-yellow-300 opacity-0 group-hover:opacity-100 pointer-events-none transition z-10 whitespace-nowrap">
                {!isMyTurn
                  ? "Solo el propietario puede ver sus cartas"
                  : mustTrade
                  ? "¡Debes intercambiar cartas!"
                  : `Cartas: ${cards?.length || 0}`}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-100 rotate-45 border-l border-b border-yellow-300" />
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de trade obligatorio */}
        {mustTrade && isMyTurn && (
          <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 text-center">
            ¡Debes intercambiar cartas!
          </div>
        )}

        {/* Botón de acción */}
        {isSubFase && (
          <motion.button
            onClick={handleNextFase}
            disabled={mustTrade || !isMyTurn}
            className={`w-full py-2 border-2 rounded-2xl transition ${
              mustTrade
                ? "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                : !isMyTurn
                ? "bg-gray-700 text-gray-400 border-gray-600 cursor-default"
                : "bg-[#3b2a1a] text-[#d4af37] border-[#8b4513] hover:bg-[#4a2c1a] cursor-pointer"
            }`}
            whileHover={isMyTurn && !mustTrade ? { scale: 1.02 } : {}}
            whileTap={isMyTurn && !mustTrade ? { scale: 0.98 } : {}}
          >
            {fase === "Recolocacio" ? "Terminar turno" : "Siguiente"}
          </motion.button>
        )}

        {/* Contador de cartas seleccionadas */}
        {selectedCards.length > 0 && isMyTurn && (
          <div className="mt-2 text-xs text-center text-gray-600">
            Seleccionadas: {selectedCards.length}/3
          </div>
        )}
      </div>

      {/* CardDeck y TradePopup - Solo mostrar si es el propietario */}
      {isMyTurn && (
        <>
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
            mustTrade={mustTrade}
            canTrade={canTrade}
          />
        </>
      )}
    </>
  );
}
