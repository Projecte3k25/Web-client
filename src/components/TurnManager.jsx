import { useEffect, useState } from "react";
import { Sword, ArrowsClockwise, ShieldCheck, Cards } from "phosphor-react";
import { SquaresPlusIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";
import useWebSocket from "../hooks/useWebSocket";
import CardDeck from "./CardDeck";
import TradePopup from "./TradePopup"; // Importar TradePopup
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const posicioColors = {
  1: "#00913f",
  2: "#2196F3",
  3: "#FFEB3B",
  4: "#9C27B0",
  5: "#FF9800",
  6: "#c81d11",
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

  // Estados para el sistema de cartas
  const [selectedCards, setSelectedCards] = useState([]);
  const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
  const [cards, setCards] = useState(cartas || []);

  const color = posicioColors[posi] || "#000";

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
  }, [jugador.id, tiempoTotal]);

  useEffect(() => {
    if (jugador) {
      toast(`Torn del jugador: ${jugador.nom}, fase de ${fase}`, {
        duration: 3000,
        position: "top-center",
      });
    }
  }, [jugador?.id]);

  // Actualizar cards cuando cambie cartas
  useEffect(() => {
    if (cartas) {
      setCards(cartas);
    }
  }, [cartas]);

  const porcentaje = (tiempoRestante / tiempoTotal) * 100;
  const isSubFase = subFases.includes(fase);

  const handleNextFase = () => {
    if (!jugador || jugador.id !== myId) {
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
    // Solo permitir al propietario abrir/cerrar el deck
    if (!jugador || jugador.id !== myId) {
      return;
    }

    setIsDeckOpen(!isDeckOpen);
    if (isDeckOpen) {
      setSelectedCards([]);
      setIsTradePopupOpen(false);
    }
  };

  const handleCardClick = (card, index) => {
    // Solo permitir al propietario seleccionar cartas
    if (!jugador || jugador.id !== myId) {
      return;
    }

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

    // Aquí puedes agregar la lógica para comunicar el intercambio al backend
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
    <>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-[#2c1810]/90 border-[#8b4513] border-2 backdrop-blur-md shadow-lg rounded-xl p-4 w-52 z-60 ">
        <div className="text-center text-sm font-semibold text-gray-700 uppercase tracking-wide ">
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
              <span className="font-medium text-[#d4af37] ">{jugador.nom}</span>
              <span className="text-sm text-[#f4e4bc]/60 ">
                Tropas: {tropasDisponibles}
              </span>
            </div>
          </div>

          {/* Botón de cartas */}
          {isSubFase && (
            <div className="flex flex-col items-center gap-1">
              <button
                className={` rounded-md transition ${
                  jugador.id === myId
                    ? `hover:bg-gray-200 cursor-pointer ${
                        isDeckOpen ? "bg-gray-200" : ""
                      }`
                    : "cursor-not-allowed opacity-60"
                }`}
                disabled={!cards?.length || jugador.id !== myId}
                title={
                  jugador.id !== myId
                    ? "Solo el propietario puede ver sus cartas"
                    : `Cartas (${cards?.length || 0})`
                }
                onClick={toggleDeck}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="30"
                  height="30"
                  className={`transition-all ${
                    cards?.length > 0 && jugador.id === myId
                      ? "grayscale-0"
                      : "grayscale opacity-40"
                  }`}
                >
                  <path d="M12 8h40v48H12z" opacity="0.3" />
                  <path
                    d="M10 6h44v52H10z"
                    stroke="#000"
                    strokeWidth="2"
                    fill="#d4af37"
                  />
                  <path d="M20 12h24v8H20z" fill="#2c1810" />
                  <circle cx="32" cy="40" r="6" fill="#2c1810" />
                </svg>
              </button>
              <span className="text-[10px] text-[#f4e4bc]/60 font-medium">
                {jugador.id === myId ? cards?.length || 0 : "?"}
              </span>
            </div>
          )}
        </div>

        {/* Botón de acción */}
        {isSubFase && (
          <button
            onClick={handleNextFase}
            className="w-full py-2 bg-[#3b2a1a] text-[#d4af37] border-[#8b4513] hover:bg-[#4a2c1a] border-2 rounded-2xl cursor-pointer"
          >
            {fase === "Recolocacio" ? "Terminar turno" : "Siguiente"}
          </button>
        )}

        {/* Contador de cartas seleccionadas */}
        {selectedCards.length > 0 && jugador.id === myId && (
          <div className="mt-2 text-xs text-center text-gray-600">
            Seleccionadas: {selectedCards.length}/3
          </div>
        )}
      </div>

      {/* CardDeck y TradePopup - Solo mostrar si es el propietario */}
      {jugador.id === myId && (
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
          />
        </>
      )}
    </>
  );
}
