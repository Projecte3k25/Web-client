import { useEffect, useState } from "react";
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
  // console.log(partida.jugadors);
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
          setUltimaAccion((prev) =>
            JSON.stringify(prev) !== JSON.stringify(msg.data) ? msg.data : prev
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
        />
        {allLoaded && faseActual && jugadorActual && (
          <TurnManager
            jugador={jugadorActual}
            tiempoTotal={tiempoTurno}
            fase={faseActual}
            tropasDisponibles={tropasDisponibles}
            jugadores={partida.jugadors}
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
