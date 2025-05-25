import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Variantes de animación
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { ease: "easeIn", duration: 0.15 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 w-96 max-w-md mx-4"
          variants={modalVariants}
        >
          <AnimatePresence mode="wait">
            {!gameType ? (
              // Selección de tipo de partida
              <motion.div
                key="type-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.h2
                    className="text-2xl font-bold text-gray-800 mb-2"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Crear Nueva Partida
                  </motion.h2>
                  <motion.p
                    className="text-gray-500 text-sm font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Selecciona el tipo de partida
                  </motion.p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      type: "Ranked",
                      color: "from-yellow-600 to-orange-600",
                      shadow: "shadow-orange-500/25",
                      label: "Partida competitiva",
                    },
                    {
                      type: "Rapida",
                      color: "from-green-600 to-emerald-600",
                      shadow: "shadow-green-500/25",
                      label: "Partida rápida",
                    },
                    {
                      type: "Custom",
                      color: "from-purple-600 to-indigo-600",
                      shadow: "shadow-purple-500/25",
                      label: "Configuración custom",
                    },
                  ].map((game, index) => (
                    <motion.button
                      key={game.type}
                      onClick={() => handleGameTypeSelect(game.type)}
                      className={`w-full group relative overflow-hidden bg-gradient-to-r ${
                        game.color
                      } hover:${game.color.replace(
                        "600",
                        "500"
                      )} text-black font-semibold py-4 px-6 rounded-xl hover:shadow-lg ${
                        game.shadow
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.3 + index * 0.1 },
                      }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                        <span className="text-lg font-semibold">
                          {game.type}
                        </span>
                        <div className="w-2 h-2 bg-gray-900 rounded-full opacity-60"></div>
                      </div>
                      <p className="text-xs text-gray-900 mt-1 font-light">
                        {game.label}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <motion.div
                  className="flex justify-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg font-medium"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Cancelar
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              // Formulario para partida personalizada
              <motion.div
                key="custom-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center relative">
                  <motion.button
                    onClick={goBack}
                    className="absolute -top-2 -left-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ←
                  </motion.button>
                  <motion.h2
                    className="text-2xl font-bold text-gray-800 mb-2"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                  >
                    Partida Personalizada
                  </motion.h2>
                  <motion.p
                    className="text-gray-500 text-sm font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Configura tu partida
                  </motion.p>
                </div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Nombre de la partida
                    </label>
                    <motion.input
                      type="text"
                      className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 placeholder-gray-400 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                      placeholder="Ingresa el nombre..."
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      whileFocus={{
                        scale: 1.01,
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Máximo de jugadores
                    </label>
                    <motion.input
                      type="number"
                      min={2}
                      max={6}
                      className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      required
                      whileFocus={{
                        scale: 1.01,
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                      }}
                    />
                  </div>

                  <motion.div
                    className="flex items-center gap-3 py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="sr-only"
                      />
                      <motion.div
                        className={`w-11 h-6 rounded-full transition-all duration-200 ${
                          isPrivate ? "bg-gray-600" : "bg-gray-300"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 ml-0.5`}
                          animate={{
                            x: isPrivate ? 22 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        ></motion.div>
                      </motion.div>
                    </label>
                    <span className="text-gray-700 font-light">
                      Partida privada
                    </span>
                  </motion.div>

                  <AnimatePresence>
                    {isPrivate && (
                      <motion.div
                        className="space-y-2"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-semibold text-gray-600">
                          Contraseña
                        </label>
                        <motion.input
                          type="password"
                          className="w-full p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-gray-800 placeholder-gray-400 focus:border-gray-400/70 focus:bg-white/80 focus:outline-none transition-all duration-200"
                          placeholder="Ingresa la contraseña..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          whileFocus={{
                            scale: 1.01,
                            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="flex justify-between gap-3 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={goBack}
                    className="px-6 py-3 bg-red-500 hover:bg-red-500/50 text-gray-900 hover:text-gray-800 rounded-lg font-light border border-gray-200/50"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Atrás
                  </motion.button>
                  <motion.button
                    onClick={handleCustomSubmit}
                    className="px-6 py-3 bg-emerald-500/80 hover:bg-emerald-600/80 text-gray-800 rounded-lg font-medium border border-gray-200/50 hover:border-gray-300/70"
                    variants={buttonVariants}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                    whileTap="tap"
                  >
                    Crear Partida
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateGameModal;
