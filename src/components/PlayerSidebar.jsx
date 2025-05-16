import React from "react";
import clsx from "clsx";

const posicioColors = {
  1: "#00913f", // verde
  2: "#2196F3", // azul
  3: "#FFEB3B", // amarillo
  4: "#9C27B0", // morado
  5: "#FF9800", // naranja
  6: "#c81d11", // rojo
};

const PlayerSidebar = ({ jugadores, jugadorActual }) => {
  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 p-4 bg-amber-100/40 backdrop-blur-md rounded-l-2xl shadow-xl z-40">
        {jugadores.map((jugador) => {
          const isActual = jugador.jugador.id === jugadorActual?.id;
          const borderColor = posicioColors[jugador.posicio] || "#ccc";

          return (
            <img
              key={jugador.jugador.id}
              src={jugador.jugador.avatar}
              alt={jugador.jugador.nom}
              style={{ borderColor }}
              className={clsx(
                "w-16 h-16 rounded-full border-4 transition-all duration-300 object-cover",
                isActual ? "animate-gelatine" : "grayscale opacity-70"
              )}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes gelatine {
          0%, 100% { transform: scale(1, 1); }
          25% { transform: scale(0.9, 1.1); }
          50% { transform: scale(1.1, 0.9); }
          75% { transform: scale(0.95, 1.05); }
        }

        .animate-gelatine {
          animation: gelatine 0.6s infinite;
        }
      `}</style>
    </>
  );
};

export default PlayerSidebar;
