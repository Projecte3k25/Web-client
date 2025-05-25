import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useWebSocket from "../hooks/useWebSocket";
import { Lock } from "lucide-react";
import CreateGameModal from "./CreateGameModal";

const GameList = ({ games = [] }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const socket = useWebSocket();

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    },
  };

  const bgVariants = {
    normal: { filter: "grayscale(100%)", scale: 1 },
    hover: { filter: "grayscale(0%)", scale: 1.05 },
  };

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

      <motion.ul
        className="px-4 overflow-hidden space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {games.map((game) => (
            <motion.li
              key={game.id}
              onClick={() => handleJoinGame(game)}
              className={`group relative flex items-center justify-between p-4 w-full max-w-full rounded-2xl cursor-pointer overflow-hidden
                ${
                  game.publica === 0
                    ? "border-3 border-yellow-400"
                    : "border-3 border-green-500"
                }`}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/war.jpg')" }}
                variants={bgVariants}
                initial="normal"
                whileHover="hover"
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex flex-col text-gray-900 drop-shadow pl-4 pointer-events-none">
                <span className="text-xl font-bold text-black group-hover:text-black transition-colors duration-300 drop-shadow-md">
                  {game.nom}
                </span>
                <span className="text-sm font-bold text-black group-hover:text-black transition-colors duration-300 drop-shadow-md">
                  Jugadores en lobby: {game.current_players}/{game.max_players}
                </span>
              </div>

              {game.publica === 0 && (
                <motion.div
                  className="relative z-10 ml-4 text-white drop-shadow"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="./lock.svg"
                    alt="Partida privada"
                    className="w-7 h-7"
                  />
                </motion.div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Modal de contraseña con animación */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50  "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl space-y-4 w-80 max-w-[90vw]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.3,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-lg font-bold">Partida privada</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Introduce la contraseña para unirte.
                </p>
              </motion.div>

              <motion.form
                onSubmit={handlePasswordSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Contraseña"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    autoFocus
                    required
                  />
                </motion.div>

                <div className="flex justify-end gap-2 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Entrar
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center pt-4 fixed bottom-4 left-0 right-0">
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.98 }}
        >
          Crear nueva partida
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateGameModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameList;
