import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import messageHandlers from "../services/messageHandlers";

const PlayerList = () => {
  const location = useLocation();
  const initialPlayers = location.state?.players || [];
  const [players, setPlayers] = useState(initialPlayers);
  const socket = useWebSocket();
  useEffect(() => {
    if (players.length === 0) {
      socket.send(JSON.stringify({ method: "getJugadors" }));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = socket.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);
        const handler = messageHandlers[data.method];

        if (handler) {
          handler(data, setPlayers);
        } else {
          console.warn("Método no reconocido:", data.method);
        }
      } catch (err) {
        console.error("Error al parsear mensaje:", err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  return (
    <div className="max-h-[500px] overflow-y-auto space-y-2">
      <h3 className="text-2xl">Jugadores en el Lobby</h3>
      <ul>
        {players.map((player) => (
          <li
            key={player.id}
            className="p-2 w-full border border-blue-500 rounded mb-1"
          >
            {player.nom}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
