import { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const CreateGameModal = ({ onClose }) => {
  const socket = useWebSocket();
  const [gameType, setGameType] = useState(null);
  const [nom, setNom] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleGameTypeSelect = (type) => {
    if (type === "Ranked" || type === "Rapida") {
      // Enviar directamente al servidor
      socket.send(
        JSON.stringify({
          method: "createPartida",
          data: { tipus: type },
        })
      );
      onClose();
    } else {
      setGameType(type);
    }
  };

  const handleCustomSubmit = () => {
    if (!nom.trim()) return;

    socket.send(
      JSON.stringify({
        method: "createPartida",
        data: {
          tipus: "Custom",
          max_players: maxPlayers,
          password: password,
          nom: nom,
        },
      })
    );

    onClose();
  };

  const goBack = () => {
    setGameType(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 border-white/20 backdrop-blur-md z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 w-96 max-w-md mx-4">
        {!gameType ? (
          // Selección de tipo de partida
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-light text-gray-800 mb-2">
                Crear Nueva Partida
              </h2>
              <p className="text-gray-500 text-sm font-light">
                Selecciona el tipo de partida
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleGameTypeSelect("Ranked")}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                  <span className="text-lg font-light">Ranked</span>
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                </div>
                <p className="text-xs text-gray-900 mt-1 font-light">
                  Partida competitiva
                </p>
              </button>

              <button
                onClick={() => handleGameTypeSelect("Rapida")}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                  <span className="text-lg font-light">Rápida</span>
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                </div>
                <p className="text-xs text-gray-900 mt-1 font-light">
                  Partida rápida
                </p>
              </button>

              <button
                onClick={() => handleGameTypeSelect("Custom")}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                  <span className="text-lg font-light">Personalizada</span>
                  <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                </div>
                <p className="text-xs text-gray-900 mt-1 font-light">
                  Configuración custom
                </p>
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // Formulario para partida personalizada
          <div className="space-y-6">
            <div className="text-center relative">
              <button
                onClick={goBack}
                className="absolute -top-2 -left-2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100/50"
              >
                ←
              </button>
              <h2 className="text-2xl font-light text-gray-800 mb-2">
                Partida Personalizada
              </h2>
              <p className="text-gray-500 text-sm font-light">
                Configura tu partida
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-600">
                  Nombre de la partida
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 placeholder-gray-400 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                  placeholder="Ingresa el nombre..."
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-light text-gray-600">
                  Máximo de jugadores
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-all duration-200 ${
                      isPrivate ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        isPrivate ? "translate-x-5" : "translate-x-0"
                      } mt-0.5 ml-0.5`}
                    ></div>
                  </div>
                </label>
                <span className="text-gray-700 font-light">
                  Partida privada
                </span>
              </div>

              {isPrivate && (
                <div className="space-y-2">
                  <label className="text-sm font-light text-gray-600">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 placeholder-gray-400 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                    placeholder="Ingresa la contraseña..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-red-500 hover:bg-red-500/50 text-gray-900 hover:text-gray-800 rounded-lg transition-all duration-200 font-light border border-gray-200/50"
              >
                Atrás
              </button>
              <button
                onClick={handleCustomSubmit}
                className="px-6 py-3 bg-emerald-500/80 hover:emerald-800/80 text-gray-800 rounded-lg transition-all duration-200 font-medium border border-gray-200/50 hover:border-gray-300/70 hover:shadow-lg"
              >
                Crear Partida
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGameModal;
