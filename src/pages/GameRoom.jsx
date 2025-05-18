import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import LoadingScreen from "../components/LoadingScreen";
import RiskMap from "../components/RiskMap";
import PlayerList from "../components/PlayerList";
import GameBoard from "../components/GameBoard";
import PlayerSidebar from "../components/PlayerSidebar";
import TurnManager from "../components/TurnManager";

const GameRoom = () => {
  const { state } = useLocation();

  const socket = useWebSocket();
  const partida = state?.partida;
  const game = state?.game;
  const players = state?.players;
  // console.log(partida.territoris);
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
  const faseRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log(msg);
        if (msg.method === "loaded") {
          setPlayersLoaded((prev) =>
            prev.includes(msg.data.id) ? prev : [...prev, msg.data.id]
          );
        }
        if (msg.method === "canviFase") {
          const {
            fase,
            jugadorActual,
            temps: tiempo,
            territoris: territorios,
            tropas,
            cartas,
          } = msg.data;
          faseRef.current = msg.data.fase;
          setFaseActual(fase);
          setJugadorActual(jugadorActual);
          setTropasDisponibles(tropas);
          setCartas(cartas);
          setTiempoTurno(tiempo);
          setTerritorios(territorios);
        }

        if (msg.method === "allLoaded") {
          setAllLoaded(true);
        }
        if (msg.method === "accio") {
          let nuevaAccion = null;
          const fase = faseRef.current;
          console.log(fase);
          switch (fase) {
            case "Colocacio":
              nuevaAccion = {
                tipo: "Colocacio",
                territorio: msg.data.territori,
                posicio: msg.data.posicio,
              };
              break;

            case "Reforç":
              nuevaAccion = {
                tipo: "Reforç",
                territorio: msg.data.territori,
              };
              break;

            case "ReforçTropes":
              nuevaAccion = {
                tipo: "ReforçTropes",
                territorio: msg.data.territori,
                tropas: msg.data.tropas,
              };
              break;

            case "Atac":
              nuevaAccion = {
                tipo: "Atac",
                from: msg.data.FromTerritori,
                to: msg.data.toTerritori,
                dadosAtac: msg.data.dadosAtac,
                dadosDefensa: msg.data.dadosDefensa,
                atacTropas: msg.data.atacTropas,
                defTropas: msg.data.defTropas,
                conquista: msg.data.conquista,
              };
              break;

            case "Recolocacio":
              nuevaAccion = {
                tipo: "Recolocacio",
                from: msg.data.FromTerritori,
                to: msg.data.toTerritori,
                tropas: msg.data.tropas,
              };
              break;

            default:
              console.warn("Fase no reconocida para accio", faseActual);
              nuevaAccion = msg.data;
              break;
          }

          setUltimaAccion((prev) =>
            JSON.stringify(prev) !== JSON.stringify(nuevaAccion)
              ? nuevaAccion
              : prev
          );
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.socket?.addEventListener("message", handleMessage);
    return () => socket.socket?.removeEventListener("message", handleMessage);
  }, [socket]);
  // console.log(partida.jugadors);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
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
          jugadors={partida.jugadors} /**/
          fase={faseActual} /**/
          jugadorActual={jugadorActual} /**/
          territorios={territorios}
          ultimaAccion={ultimaAccion}
          fronteras={partida.territoris}
        />
        {allLoaded && faseActual && jugadorActual && (
          <TurnManager
            jugador={jugadorActual}
            tiempoTotal={tiempoTurno}
            fase={faseActual}
            tropasDisponibles={tropasDisponibles}
            jugadores={partida.jugadors}
            cartas
          />
        )}

        {allLoaded && faseActual && partida?.jugadors && jugadorActual && (
          <PlayerSidebar
            jugadores={partida.jugadors}
            jugadorActual={jugadorActual}
          />
        )}
      </GameBoard>
    </div>
  );
};
export default GameRoom;
