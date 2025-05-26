import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useProfile } from "../context/ProfileContext";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

// Objeto de colores para evitar interpolación dinámica de clases
const colorMap = {
  blue: {
    bgFrom: "from-blue-50",
    bgTo: "to-blue-100",
    border: "border-blue-200",
    text: "text-blue-600",
    textSecondary: "text-blue-700",
  },
  purple: {
    bgFrom: "from-purple-50",
    bgTo: "to-purple-100",
    border: "border-purple-200",
    text: "text-purple-600",
    textSecondary: "text-purple-700",
  },
  green: {
    bgFrom: "from-green-50",
    bgTo: "to-green-100",
    border: "border-green-200",
    text: "text-green-600",
    textSecondary: "text-green-700",
  },
  red: {
    bgFrom: "from-red-50",
    bgTo: "to-red-100",
    border: "border-red-200",
    text: "text-red-600",
    textSecondary: "text-red-700",
  },
};

const ProfilePopup = ({ onClose }) => {
  const { profile, updateProfile } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  if (!profile) return null;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen debe ser menor a 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`http://${backendHost}/api/profile/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error al subir la imagen");

      const data = await response.json();
      updateProfile?.({ ...profile, avatar: data.avatarPath });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const winRate =
    profile.games > 0 ? ((profile.wins / profile.games) * 100).toFixed(1) : 0;

  // Variantes de animación
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { ease: "easeIn", duration: 0.15 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.05,
        duration: 0.3,
      },
    }),
  };

  // Componente reutilizable para estadísticas
  const StatCard = ({ value, label, color }) => {
    const colors = colorMap[color] || colorMap.blue;
    return (
      <motion.div
        className={`bg-gradient-to-br ${colors.bgFrom} ${colors.bgTo} p-4 rounded-xl text-center border ${colors.border}`}
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
        whileHover={{ y: -2 }}
      >
        <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
        <div className={`text-sm ${colors.textSecondary}`}>{label}</div>
      </motion.div>
    );
  };

  const SmallStatCard = ({ value, label, color }) => {
    const colors = colorMap[color] || colorMap.blue;
    return (
      <motion.div
        className={`bg-gradient-to-br ${colors.bgFrom} ${colors.bgTo} p-3 rounded-lg text-center border ${colors.border}`}
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
        whileHover={{ y: -2 }}
      >
        <div className={`text-lg font-semibold ${colors.text}`}>{value}</div>
        <div className={`text-xs ${colors.textSecondary}`}>{label}</div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-white rounded-2xl p-8 w-96 max-w-[95vw] relative shadow-2xl"
          variants={modalVariants}
        >
          {/* Botón cerrar con animación */}
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-500 transition-all"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>

          <div className="flex flex-col items-center space-y-6">
            {/* Avatar con animación */}
            <motion.div
              className="relative group"
              custom={0}
              variants={contentVariants}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                {profile.avatar ? (
                  <motion.img
                    src={`http://${backendHost}${profile.avatar}`}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    key={profile.avatar}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-gray-400">
                    {profile.nom?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              {/* Overlay para upload */}
              <motion.div
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                onClick={triggerFileInput}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                {isUploading ? (
                  <motion.div
                    className="rounded-full h-6 w-6 border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>

            {/* Error message con animación */}
            {uploadError && (
              <motion.div
                className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200 w-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {uploadError}
              </motion.div>
            )}

            {/* Nombre del usuario */}
            <motion.div
              className="text-center"
              custom={1}
              variants={contentVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.nom}
              </h2>
              <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Fes clic per modificar el avatar
              </p>
            </motion.div>

            {/* Estadísticas con animación escalonada */}
            <motion.div
              className="w-full space-y-4"
              custom={2}
              variants={contentVariants}
            >
              {/* Estadísticas principales */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <StatCard
                  value={profile.games ?? 0}
                  label="Partides"
                  color="blue"
                />
                <StatCard
                  value={profile.elo ?? 0}
                  label="Elo Rating"
                  color="purple"
                />
              </motion.div>

              {/* Wins/Losses */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <SmallStatCard
                  value={profile.wins ?? 0}
                  label="Guanyades"
                  color="green"
                />
                <SmallStatCard
                  value={profile.loses ?? 0}
                  label="Perdudes"
                  color="red"
                />
              </motion.div>

              {/* Win Rate */}
              {profile.games > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg text-center border border-yellow-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="text-lg font-semibold text-orange-600">
                    {winRate}%
                  </div>
                  <div className="text-xs text-orange-700">
                    Taxa de Victòries
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfilePopup;
