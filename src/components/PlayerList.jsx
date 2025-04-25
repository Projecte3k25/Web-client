import { useEffect, useState } from "react";
import WebSocketService from "../services/WebSocketService";

const PlayerList = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Al inicio, pedimos la lista de jugadores o nos suscribimos a actualizaciones
    WebSocketService.onMessage((event) => {
      const data = JSON.parse(event.data);

      if (data.method === "playerJoined") {
        setPlayers((prevPlayers) => [...prevPlayers, data.player]);
      }
    });

    // Envía mensaje para obtener jugadores iniciales cuando se conecta
    WebSocketService.send(JSON.stringify({ method: "getPlayersLobby" }));

    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <div className="max-h-[400px] overflow-y-auto space-y-2">
      <h3 className="text-2xl">Jugadores en el Lobby</h3>
      <ul>
        {players.map((player) => (
          <li
            key={player.id}
            className="p-2 w-full border border-blue-500 rounded"
          >
            {player.name}
          </li>
        ))}
        {[
          "Player 1",
          "Player 2",
          "Player 3",
          "Player 4",
          "Player 5",
          "Player 6",
        ].map((name, index) => (
          <li key={index} className="p-2 w-full border border-blue-500 rounded">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
