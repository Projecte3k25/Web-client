import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const posicioColors = {
  1: "#00913f",
  2: "#2196F3",
  3: "#FFEB3B",
  4: "#9C27B0",
  5: "#FF9800",
  6: "#008080",
};

const LoadingScreen = ({ players, gameName, loadedIds }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-4">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Partida: {gameName}
      </motion.h1>

      <motion.p
        className="mb-8 text-lg"
        animate={{ opacity: pulse ? 0.8 : 1 }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        Esperant que tots els jugadors carreguin...
      </motion.p>

      <div className="w-full max-w-md space-y-3">
        {players.map((player, index) => {
          const isLoaded =
            loadedIds.includes(player.jugador.id) || player.jugador.id === 0;

          return (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-900 shadow-lg border border-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: posicioColors[player.posicio] || "#aaa",
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <motion.img
                  src={`http://${backendHost}${player.jugador.avatar}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border-2 border-gray-700"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                />

                <div>
                  <motion.span className="font-medium block">
                    {player.jugador.nom}
                  </motion.span>
                  <motion.span className="text-xs text-gray-400 block">
                    ELO: {player.jugador.elo}
                  </motion.span>
                </div>
              </div>

              <AnimatePresence>
                {isLoaded && (
                  <motion.span
                    className="text-green-400 text-sm flex items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring" }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      ✅
                    </motion.span>
                    <span className="ml-1">READY</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="mt-8 w-full max-w-md h-1 bg-gray-800 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
