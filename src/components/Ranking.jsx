import { motion, AnimatePresence } from "framer-motion";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const Ranking = ({ ranking }) => {
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  const podiumVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    }),
  };

  // Obtener top 3 para el podio
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <motion.h3
        className="text-2xl  text-gray-950 text-center font-bold mb-4 pb-2 border-b border-white/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Ranking ELO
      </motion.h3>

      {/* Podio minimalista para los primeros 3 */}
      {topThree.length > 0 && (
        <motion.div
          className="flex justify-between items-end gap-2 mb-6 mt-15 h-24"
          initial="hidden"
          animate="visible"
        >
          {topThree.map((user, index) => (
            <motion.div
              key={user.id}
              className={`flex-1 flex flex-col items-center ${
                index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"
              }`}
              custom={index}
              variants={podiumVariants}
            >
              <motion.div
                className={`w-full flex flex-col items-center justify-end ${
                  index === 0
                    ? "bg-yellow-500/30 h-20"
                    : index === 1
                    ? "bg-gray-400/30 h-16"
                    : "bg-amber-700/30 h-12"
                } rounded-t-md`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.img
                  src={`http://${backendHost}${user.avatar}`}
                  className="h-8 w-8 rounded-full object-cover border border-white/30 shadow-sm -mb-4"
                  alt={user.nom}
                  whileHover={{ scale: 1.2 }}
                />
              </motion.div>
              <div className="mt-4 text-center w-full truncate px-1">
                <div className=" font-semibold truncate">{user.nom}</div>
                <div className=" font-bold text-white/80">{user.elo} ELO</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Lista del resto de participantes */}
      <motion.ul
        className="space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {rest.map((user, index) => (
            <motion.li
              key={user.id}
              className="flex justify-between items-center p-2 rounded-md hover:bg-white/5 transition-colors"
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-white/70 w-5 text-right">
                  {index + 4}.
                </span>
                <motion.img
                  src={`http://${backendHost}${user.avatar}`}
                  className="h-6 w-6 rounded-full object-cover border border-white/20"
                  alt={user.nom}
                  whileHover={{ scale: 1.2 }}
                />
                <span className=" font-medium truncate">{user.nom}</span>
              </div>
              <span className="font-semibold text-white/90">{user.elo}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};

export default Ranking;
