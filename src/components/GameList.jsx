import { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

import { Lock } from "lucide-react";
import CreateGameModal from "./CreateGameModal";

const GameList = ({ games = [] }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const socket = useWebSocket();

  const handleJoinGame = (game) => {
    if (game.publica === 0) {
      setSelectedGameId(game.id);
      setShowPasswordModal(true);
    } else {
      const message = JSON.stringify({
        method: "joinPartida",
        data: { partida: game.id },
      });

      socket.send(message);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!selectedGameId) return;

    const game = games.find((g) => g.id === selectedGameId);
    if (game) {
      const message = JSON.stringify({
        method: "joinPartida",
        data: { partida: selectedGameId, password: passwordInput },
      });
      socket.send(message);
    }

    setShowPasswordModal(false);
    setPasswordInput("");
    setSelectedGameId(null);
  };

  return (
    <div className="max-h-[500px] min-h-[500px] overflow-y-auto space-y-2 relative">
      <h3 className="text-4xl text-center text-black pb-3.5">
        Partidas disponibles
      </h3>
      <ul className="px-4 overflow-hidden">
        {games.map((game) => (
          <li
            key={game.id}
            onClick={() => handleJoinGame(game)}
            className={`group relative flex items-center justify-between p-4 w-full max-w-full rounded-2xl mb-2 cursor-pointer shadow transition-transform transform hover:scale-102 overflow-hidden
    ${
      game.publica === 0
        ? "border-3 border-yellow-400"
        : "border-3 border-green-500"
    }`}
          >
            <div
              className="absolute inset-0  bg-center filter grayscale group-hover:filter-none transition-all duration-500"
              style={{ backgroundImage: "url('/war.jpg')" }}
            ></div>

            <div className="relative z-10 flex flex-col text-gray-900 drop-shadow pl-4 ">
              <span className="text-xl font-bold text-black group-hover:text-black  transition-colors duration-300 drop-shadow-md">
                {game.nom}
              </span>
              <span className="text-sm font-bold text-black group-hover:text-black transition-colors duration-300 drop-shadow-md">
                Jugadores en lobby: {game.current_players}/{game.max_players}
              </span>
            </div>

            {game.publica === 0 && (
              <div className="relative z-10 ml-4 text-white drop-shadow">
                {/* <Lock
                  size={50}
                  // fontWeight={60}
                  strokeWidth={2}
                  stroke="black"
                  className="text-black "
                /> */}
                <img src="./lock.svg" alt="" className="w-7 h-7 lock-icon" />
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
                className="px-4 py-2 bg-gray-600 rounded hover:bg-red-800"
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
      <div className="flex justify-center pt-4 fixed bottom-4 ">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
        >
          Crear nueva partida
        </button>
      </div>

      {showCreateModal && (
        <CreateGameModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default GameList;
