import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import LoadingScreen from "../components/LoadingScreen";
import RiskMap from "../components/RiskMap";
import PlayerList from "../components/PlayerList";
import GameBoard from "../components/GameBoard";
import PlayerSidebar from "../components/PlayerSidebar";
import TurnManager from "../components/TurnManager";
import GameChat from "../components/GameChat";
import AnimatedCardFromDeck from "../components/AnimatedCardFromDeck";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const GameRoom = () => {
  const { state } = useLocation();

  const socket = useWebSocket();
  const partida = state?.partida;
  const game = state?.game;
  const players = state?.players;
  const [svgUpdateTrigger, setSvgUpdateTrigger] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [playersLoaded, setPlayersLoaded] = useState([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [faseActual, setFaseActual] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [tropasDisponibles, setTropasDisponibles] = useState(0);
  const [turno, setTurno] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [tiempoTurno, setTiempoTurno] = useState(0);
  const [territorios, setTerritorios] = useState({});
  const [ultimaAccion, setUltimaAccion] = useState(null);
  const [showCardAnimation, setShowCardAnimation] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const faseRef = useRef(null);
  const [posicioActual, setposicioActual] = useState(null);

  // Referencia para el chat
  const addSystemMessageRef = useRef(null);

  // Función para obtener nombre del jugador por ID
  const getPlayerName = (playerId) => {
    if (!playerId) return "Jugador desconocido";
    const player = partida?.jugadors?.find((p) => p.jugador.id === playerId);
    return player?.jugador?.nom || `Jugador ${playerId}`;
  };

  // Función para obtener nombre del territorio
  const getTerritoryName = (territoryId) => {
    // Aquí deberías tener un mapa de territorios con nombres
    // Por ahora retornamos el ID
    return territoryId || "Territorio desconocido";
  };

  // Función para generar mensaje del sistema basado en la acción
  const generateSystemMessage = (accion) => {
    // Usar el jugador actual si no hay posición específica en la acción
    const playerId = accion.jugadorId || jugadorActual;
    const playerName = getPlayerName(playerId);

    switch (accion.tipo) {
      case "Colocacio":
        return `${playerName} ha colocado tropas en ${getTerritoryName(
          accion.territorio
        )}`;

      case "Reforç":
        return `${playerName} ha reforzado ${getTerritoryName(
          accion.territorio
        )}`;

      case "ReforçTropes":
        return `${playerName} ha añadido ${
          accion.tropas
        } tropas a ${getTerritoryName(accion.territorio)}`;

      case "Atac":
        const fromTerritory = getTerritoryName(accion.from);
        const toTerritory = getTerritoryName(accion.to);
        const resultado = accion.conquista ? "conquistó" : "atacó";
        return `${playerName} ${resultado} ${toTerritory} desde ${fromTerritory} (${accion.dausAtac?.join(
          ","
        )} vs ${accion.dausDefensa?.join(",")})`;

      case "Recolocacio":
        return `${playerName} ha movido ${
          accion.tropas
        } tropas de ${getTerritoryName(accion.from)} a ${getTerritoryName(
          accion.to
        )}`;

      default:
        return `${playerName} realizó una acción: ${accion.tipo}`;
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log(msg);

        if (msg.method === "loaded" && !allLoaded) {
          setPlayersLoaded((prev) => {
            if (prev.includes(msg.data.id)) return prev;
            const newLoaded = [...prev, msg.data.id];

            // Mensaje del sistema cuando se conecta un jugador
            const playerName = getPlayerName(msg.data.id);
            addSystemMessage(`${playerName} se ha conectado a la partida`);

            return newLoaded;
          });
        }

        if (msg.method === "canviFase") {
          const {
            fase,
            jugadorActual,
            posicio,
            temps: tiempo,
            territoris: territorios,
            tropas,
            cartas,
          } = msg.data;

          faseRef.current = msg.data.fase;
          setFaseActual(fase);
          setJugadorActual(jugadorActual);
          setposicioActual(posicio);
          setTropasDisponibles(tropas);
          setCartas(cartas);
          setTiempoTurno(tiempo);
          setTerritorios(territorios);

          // Mensaje del sistema para cambio de fase
          const playerName = getPlayerName(jugadorActual);
          addSystemMessage(`Fase ${fase}: Es el turno de ${playerName}`);
        }

        if (msg.method === "allLoaded") {
          setAllLoaded(true);
        }

        if (msg.method === "accio") {
          let nuevaAccion = null;
          const fase = faseRef.current;

          switch (fase) {
            case "Colocacio":
              nuevaAccion = {
                tipo: "Colocacio",
                territorio: msg.data.territori,
                jugadorId: msg.data.jugadorId || jugadorActual,
              };
              break;

            case "Reforç":
              nuevaAccion = {
                tipo: "Reforç",
                territorio: msg.data.territori,
                jugadorId: msg.data.jugadorId || jugadorActual,
              };
              break;

            case "ReforçTropes":
              nuevaAccion = {
                tipo: "ReforçTropes",
                territorio: msg.data.territori,
                tropas: msg.data.tropas,
                jugadorId: msg.data.jugadorId || jugadorActual,
              };
              setTropasDisponibles((prev) =>
                Math.max(0, prev - msg.data.tropas)
              );
              break;

            case "Atac":
              nuevaAccion = {
                tipo: "Atac",
                from: msg.data.from,
                to: msg.data.to,
                dausAtac: msg.data.dausAtac,
                dausDefensa: msg.data.dausDefensa,
                atacTropas: msg.data.atacTropas,
                defTropas: msg.data.defTropas,
                conquista: msg.data.conquista,
                tropasAtacTotal: msg.data.tropasTotalsAtac,
                tropasDefTotal: msg.data.torpasTotalsDefensa,
                jugadorId: msg.data.jugadorId || jugadorActual,
              };
              break;

            case "Recolocacio":
              nuevaAccion = {
                tipo: "Recolocacio",
                from: msg.data.from,
                to: msg.data.to,
                tropas: msg.data.tropas,
                jugadorId: msg.data.jugadorId || jugadorActual,
              };
              break;

            default:
              console.warn("Fase no reconocida para accio", faseActual);
              nuevaAccion = msg.data;
              break;
          }

          setUltimaAccion((prev) => {
            const isNewAction =
              JSON.stringify(prev) !== JSON.stringify(nuevaAccion);

            // Añadir mensaje del sistema para la nueva acción
            if (isNewAction) {
              const systemMessage = generateSystemMessage(nuevaAccion);
              addSystemMessage(systemMessage);
            }

            return isNewAction ? nuevaAccion : prev;
          });
        }

        // Manejar otros eventos del juego
        if (msg.method === "jugadorEliminado") {
          const playerName = getPlayerName(msg.data.jugadorId);
          addSystemMessage(`${playerName} ha sido eliminado de la partida`);
        }

        if (msg.method === "partidaTerminada") {
          const winnerName = getPlayerName(msg.data.ganador);
          addSystemMessage(
            `¡Partida terminada! ${winnerName} ha ganado la partida`
          );
        }
        if (msg.method === "robaCarta") {
          const cartaData = msg.data;

          const cardFileName = `${cartaData.nom}`;

          setCurrentCard(cardFileName);
          setShowCardAnimation(true);

          // Cerrar la animación después de 4 segundos
          setTimeout(() => {
            setShowCardAnimation(false);
            setCurrentCard(null);
            setSvgUpdateTrigger((prev) => prev + 1);
          }, 6000);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.socket?.addEventListener("message", handleMessage);
    return () => socket.socket?.removeEventListener("message", handleMessage);
  }, [socket, partida, allLoaded]);

  // Función para recibir la referencia del addSystemMessage del chat
  const handleSystemMessageRef = (addSystemMessageFn) => {
    addSystemMessageRef.current = addSystemMessageFn;
  };

  // Queue para manejar mensajes del sistema de forma asíncrona
  const systemMessageQueue = useRef([]);

  // Procesar queue de mensajes del sistema
  useEffect(() => {
    if (systemMessageQueue.current.length > 0 && addSystemMessageRef.current) {
      const messages = [...systemMessageQueue.current];
      systemMessageQueue.current = [];

      // Usar setTimeout para evitar actualizaciones durante el render
      setTimeout(() => {
        messages.forEach((message) => {
          if (addSystemMessageRef.current) {
            addSystemMessageRef.current(message);
          }
        });
      }, 0);
    }
  }, [systemMessageQueue.current.length]);

  // Prevenir duplicados de mensajes del sistema
  const lastSystemMessageRef = useRef("");

  // Función helper para agregar mensajes del sistema de forma segura
  const addSystemMessage = (message) => {
    // Evitar duplicados consecutivos
    if (lastSystemMessageRef.current === message) {
      return;
    }

    lastSystemMessageRef.current = message;
    systemMessageQueue.current.push(message);
    // Forzar re-render para procesar la queue
    setGameData((prev) => ({ ...prev, _trigger: Date.now() }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <GameBoard>
        {!allLoaded && (
          <div className="absolute inset-0 z-50 bg-white flex justify-center items-center">
            <LoadingScreen
              gameName={game?.nom}
              players={partida.jugadors}
              loadedIds={playersLoaded}
            />
          </div>
        )}

        <RiskMap
          jugadors={partida.jugadors}
          fase={faseActual}
          jugadorActual={jugadorActual}
          territorios={territorios}
          ultimaAccion={ultimaAccion}
          fronteras={partida.territoris}
          setTerritorios={setTerritorios}
          tropasDisponibles={tropasDisponibles}
          svgUpdateTrigger={svgUpdateTrigger}
        />

        {allLoaded && faseActual && jugadorActual && (
          <TurnManager
            jugador={jugadorActual}
            tiempoTotal={tiempoTurno}
            fase={faseActual}
            tropasDisponibles={tropasDisponibles}
            jugadores={partida.jugadors}
            cartas={cartas}
          />
        )}

        {allLoaded && faseActual && partida?.jugadors && jugadorActual && (
          <PlayerSidebar
            jugadores={partida.jugadors}
            posicioActual={posicioActual}
          />
        )}
        {/* Chat solo visible cuando la partida está cargada */}

        <GameChat
          players={partida.jugadors}
          ws={socket}
          onSystemMessage={handleSystemMessageRef}
        />
        {showCardAnimation && currentCard && (
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <AnimatedCardFromDeck
              // frontImageUrl={`http://${backendHost}/assets/cards/${currentCard}.png`}
              frontImageUrl={`cards/${currentCard}.png`}
            />
          </div>
        )}
      </GameBoard>
    </div>
  );
};

export default GameRoom;
