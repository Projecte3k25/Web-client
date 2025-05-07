import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import messageHandlers from "../services/messageHandlers";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const GameList = () => {
  const [games, setGames] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");

  const socket = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = socket.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);

        if (data.method === "getJugadors") {
          console.log(data);
          navigate("/lobby", { state: { players: data.data } });
        } else if (data.method === "error") {
          alert(
            data.data?.message || "Ocurrió un error al unirse a la partida."
          );
        } else {
          const handler = messageHandlers[data.method];
          if (handler) {
            handler(data, setGames);
          } else {
            console.warn("Método no reconocido:", data.method);
          }
        }
      } catch (err) {
        console.error("Error al parsear mensaje:", err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket, navigate]);

  const handleJoinGame = (game) => {
    if (game.publica === 0) {
      setSelectedGameId(game.id);
      setShowPasswordModal(true);
    } else {
      const message = JSON.stringify({
        method: "joinPartida",
        data: { partida: game.id },
      });
      console.log("Enviando mensaje joinPartida (pública):", message);
      socket.send(message);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!selectedGameId) return;

    const message = JSON.stringify({
      method: "joinPartida",
      data: { partida: selectedGameId, password: passwordInput },
    });
    console.log("Enviando mensaje joinPartida (privada):", message);
    socket.send(message);
    setShowPasswordModal(false);
    setPasswordInput("");
    setSelectedGameId(null);
  };

  return (
    <div className="max-h-[500px] overflow-y-auto space-y-2 relative">
      <h3 className="text-4xl text-center text-black pb-3.5">
        Partidas disponibles
      </h3>
      <ul className="px-4 overflow-hidden">
        {games.map((game) => (
          <li
            key={game.id}
            onClick={() => handleJoinGame(game)}
            className="group relative flex items-center justify-between p-4 w-full max-w-full border border-green-500 rounded-2xl mb-2 cursor-pointer shadow transition-transform transform hover:scale-102 overflow-hidden"
          >
            <div
              className="absolute inset-0  bg-center filter grayscale group-hover:filter-none transition-all duration-500"
              style={{ backgroundImage: "url('/etiqueta.jpg')" }}
            ></div>

            <div className="relative z-10 flex flex-col text-gray-900 drop-shadow pl-4">
              <span className="text-xl font-semibold">{game.nom}</span>
              <span className="text-sm">
                Jugadores en lobby: {game.current_players}/{game.max_players}
              </span>
            </div>

            {game.publica === 0 && (
              <div className="relative z-10 ml-4 text-white drop-shadow">
                <Lock size={40} fontWeight={100} className="text-black " />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Modal de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center  z-50">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-80"
          >
            <h2 className="text-lg font-bold">Partida privada</h2>
            <p className="text-sm text-gray-600">
              Introduce la contraseña para unirte.
            </p>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded text-black"
              placeholder="Contraseña"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GameList;
