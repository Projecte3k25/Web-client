import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const EndGameScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ranking = state?.ranking;
  const currentPlayerId = state?.currentPlayerId;

  const currentPlayer =
    ranking && currentPlayerId
      ? ranking.find((player) => player.jugador.id === currentPlayerId)
      : null;

  const currentPosition =
    ranking && currentPlayerId
      ? ranking.findIndex((player) => player.jugador.id === currentPlayerId) + 1
      : null;

  const handleHome = () => {
    navigate("/home");
  };
  useEffect(() => {
    if (!ranking || !currentPlayerId) {
      navigate("/home", { replace: true });
    }
  }, [ranking, currentPlayerId, navigate]);

  if (!ranking || !currentPlayerId) {
    return null;
  }
  return (
    <Panel>
      <div className="flex h-full gap-6">
        <div className="w-1/3 border-r border-white/30 pr-4 overflow-y-auto custom-scrollbar">
          <motion.h2
            className="text-2xl font-bold mb-6 pb-2 border-b border-white/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Clasificació Final
          </motion.h2>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {ranking.map((player, index) => {
              const isCurrentPlayer = player.jugador.id === currentPlayerId;
              const eloChange = player.eloChange || 0;
              const positionColors = [
                "from-yellow-400 to-yellow-600", // 1er lugar
                "from-gray-300 to-gray-400", // 2do lugar
                "from-amber-700 to-amber-800", // 3er lugar
                "from-blue-900 to-blue-950", // otros
              ];

              const bgGradient =
                index < 3 ? positionColors[index] : positionColors[3];

              return (
                <motion.div
                  key={player.jugador.id}
                  className={`rounded-lg p-3 ${
                    isCurrentPlayer ? "ring-2 ring-white ring-opacity-50" : ""
                  }`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`bg-gradient-to-r ${bgGradient} p-3 rounded-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg w-6 text-center">
                          {index + 1}º
                        </span>
                        <img
                          src={`http://${backendHost}${player.jugador.avatar}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <span
                          className={`font-medium ${
                            isCurrentPlayer
                              ? "text-gray-700 font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {player.jugador.nom}
                          {isCurrentPlayer && (
                            <span className="ml-2 text-xs bg-white text-black px-2 py-1 rounded-full">
                              TÚ
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {player.jugador.wins}W / {player.jugador.games}G
                        </div>
                        {eloChange !== 0 && (
                          <div
                            className={`text-xs ${
                              eloChange > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {eloChange > 0 ? "+" : ""}
                            {eloChange} ELO
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Sección derecha - */}
        <div className="w-2/3 pl-4 flex flex-col overflow-hidden">
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentPlayer && (
              <>
                <motion.div
                  className="text-center mb-8"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="text-4xl font-bold mb-2">
                    {currentPosition === 1 ? (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                        ¡VICTORIA!
                      </span>
                    ) : (
                      <span>Partida Finalitzada</span>
                    )}
                  </div>
                  <div className="text-xl">
                    Posició final:{" "}
                    <span className="font-bold">{currentPosition}º</span>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-full max-w-md"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                >
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <img
                      src={`http://${backendHost}${currentPlayer.jugador.avatar}`}
                      alt="avatar"
                      className="w-24 h-24 rounded-full border-4 border-white"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {currentPlayer.jugador.nom}
                      </h3>
                      <div className="text-lg text-gray-800">
                        {currentPlayer.jugador.wins} Victories /{" "}
                        {currentPlayer.jugador.games} Partides
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="text-sm text-gray-700/70">Posició</div>
                      <div className="text-3xl font-bold">
                        {currentPosition}º
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <div className="text-sm text-gray-700/70">ELO</div>
                      <div className="text-3xl font-bold">
                        {currentPlayer.jugador.elo}
                        {currentPlayer.eloChange !== 0 && (
                          <span
                            className={`text-sm ml-2 ${
                              currentPlayer.eloChange > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            ({currentPlayer.eloChange > 0 ? "+" : ""}
                            {currentPlayer.eloChange})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-8 flex gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    onClick={handleHome}
                  >
                    Tornar al home
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Panel>
  );
};

const Panel = ({ children }) => {
  return (
    <motion.div
      className="w-[90vw] h-[90vh] mx-auto p-6 md:p-10 rounded-2xl shadow-xl bg-white/10 border border-white/20 backdrop-blur-md text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default EndGameScreen;
