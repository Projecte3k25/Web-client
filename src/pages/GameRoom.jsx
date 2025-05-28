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
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const GameRoom = () => {
  const { state } = useLocation();
  const [fueEliminado, setFueEliminado] = useState(false);
  const navigate = useNavigate();
  const socket = useWebSocket();
  const partida = state?.partida;
  const profileId = parseInt(localStorage.getItem("profile"), 10);
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

  const addSystemMessageRef = useRef(null);
  useEffect(() => {
    if (!state?.partida || !state?.game || !state?.players) {
      navigate("/home", { replace: true });
    }
  }, [state, navigate]);
  if (!state?.partida || !state?.game || !state?.players) {
    return null;
  }

  const getPlayerName = (playerId) => {
    if (!playerId) return "Jugador desconocido";
    const player = partida?.jugadors?.find((p) => p.jugador.id === playerId);
    return player?.jugador?.nom || `Jugador ${playerId}`;
  };

  const getTerritoryName = (territoryId) => {
    return territoryId || "Territorio desconocido";
  };

  const generateSystemMessage = (accion) => {
    const playerName = getPlayerName(accion.jugadorId);

    switch (accion.tipo) {
      case "Colocacio":
        return `Se ha colocado tropas en ${getTerritoryName(
          accion.territorio
        )}`;

      case "Reforç":
        return `Se ha reforzado ${getTerritoryName(accion.territorio)}`;

      case "ReforçTropes":
        return `Se ha añadido ${accion.tropas} tropas a ${getTerritoryName(
          accion.territorio
        )}`;

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

          const playerName = getPlayerName(jugadorActual);
          // addSystemMessage(`Fase ${fase}: Es el turno de ${playerName}`);
        }

        if (msg.method === "allLoaded") {
          setAllLoaded(true);
        }
        if (msg.method === "tradeCards") {
          const { tropas, territorios: territoriosACanjear } = msg.data;
          const playerName = getPlayerName(msg.data.jugadorId || jugadorActual);

          const message = `Se ha hecho un canje y ha recibido ${tropas}`;

          addSystemMessage(message);

          setTropasDisponibles((prev) => prev + tropas);
          setTerritorios((prevTerritorios) => {
            const actualizados = { ...prevTerritorios };

            territoriosACanjear.forEach((territorioId) => {
              if (actualizados[territorioId]) {
                actualizados[territorioId] = {
                  ...actualizados[territorioId],
                  tropas: actualizados[territorioId].tropas + 2,
                };
              }
            });

            return actualizados;
          });
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

            if (isNewAction) {
              const systemMessage = generateSystemMessage(nuevaAccion);
              addSystemMessage(systemMessage);
            }

            return isNewAction ? nuevaAccion : prev;
          });
        }

        if (msg.method === "jugadorEliminado") {
          setFueEliminado(true);

          addSystemMessage(`Un jugador ha sido eliminado de la partida`);
        }

        if (msg.method === "partidaTerminada") {
          const ranking = msg.data;
          if (Array.isArray(ranking) && ranking.length > 0) {
            navigate("/end", {
              state: {
                ranking,
                currentPlayerId: profileId,
              },
            });
          }
        }
        if (msg.method === "robaCarta") {
          const cartaData = msg.data;

          const cardFileName = `${cartaData.nom}`;

          setCurrentCard(cardFileName);
          setShowCardAnimation(true);

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

  const handleSystemMessageRef = (addSystemMessageFn) => {
    addSystemMessageRef.current = addSystemMessageFn;
  };

  const systemMessageQueue = useRef([]);

  useEffect(() => {
    if (systemMessageQueue.current.length > 0 && addSystemMessageRef.current) {
      const messages = [...systemMessageQueue.current];
      systemMessageQueue.current = [];

      setTimeout(() => {
        messages.forEach((message) => {
          if (addSystemMessageRef.current) {
            addSystemMessageRef.current(message);
          }
        });
      }, 0);
    }
  }, [systemMessageQueue.current.length]);

  const lastSystemMessageRef = useRef("");

  const addSystemMessage = (message) => {
    if (lastSystemMessageRef.current === message) {
      return;
    }

    lastSystemMessageRef.current = message;
    systemMessageQueue.current.push(message);

    setGameData((prev) => ({ ...prev, _trigger: Date.now() }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <GameBoard>
        {!allLoaded && !faseActual && (
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

        {faseActual && jugadorActual && (
          <TurnManager
            jugador={jugadorActual}
            tiempoTotal={tiempoTurno}
            fase={faseActual}
            tropasDisponibles={tropasDisponibles}
            jugadores={partida.jugadors}
            cartas={cartas}
          />
        )}

        {faseActual && partida?.jugadors && jugadorActual && (
          <PlayerSidebar
            jugadores={partida.jugadors}
            posicioActual={posicioActual}
          />
        )}

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
        {fueEliminado && (
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.7)" }}
              exit={{ backgroundColor: "rgba(0,0,0,0)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Has estat eliminat
                    </h2>
                  </div>

                  <p className="text-gray-300 mb-6">
                    Vols quedar-te com a espectador o sortir a l'inici?
                  </p>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      onClick={() => setFueEliminado(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Quedar-me com a espectador
                    </motion.button>
                    <motion.button
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-colors"
                      onClick={() => navigate("/home")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Anar al home
                    </motion.button>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </GameBoard>
    </div>
  );
};

export default GameRoom;
