import React from "react";
import clsx from "clsx";

const posicioColors = {
  1: "#00913f",
  2: "#2196F3",
  3: "#FFEB3B",
  4: "#9C27B0",
  5: "#FF9800",
  6: "#008080",
};

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const PlayerSidebar = ({ jugadores, posicioActual }) => {
  jugadores.sort((a, b) => a.posicio - b.posicio);

  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 p-4 z-40">
        {jugadores.length > 1 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: "32px",
              height: `${(jugadores.length - 1) * 96}px`,
              width: "4px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="rope w-full h-full"></div>
          </div>
        )}

        {jugadores.map((jugador) => {
          const isActual = jugador.posicio === posicioActual;

          const borderColor = posicioColors[jugador.posicio] || "#ccc";

          return (
            <div
              key={`${jugador.jugador.id}-${jugador.posicio}`}
              className="relative z-10"
            >
              <img
                src={`http://${backendHost}${jugador.jugador.avatar}`}
                alt={jugador.jugador.nom}
                style={{ borderColor }}
                className={clsx(
                  "w-16 h-16 rounded-full border-4 transition-all duration-300 object-cover shadow-lg",
                  isActual ? "animate-gelatine " : "grayscale "
                )}
              />
            </div>
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

        /* Estilos de cuerda espectacular */
        .rope-container {
          position: relative;
        }

        .rope {
          width: 6px;
          height: 100%;
          background: linear-gradient(
            90deg,
            #8B4513 0%,
            #D2691E 25%,
            #8B4513 50%,
            #A0522D 75%,
            #8B4513 100%
          );
          position: relative;
          border-radius: 2px;
          box-shadow: 
            inset -1px 0 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.1),
            0 0 3px rgba(0,0,0,0.2);
        }

        .rope::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(139, 69, 19, 0.8) 1px,
            rgba(139, 69, 19, 0.8) 2px,
            transparent 2px,
            transparent 3px,
            rgba(210, 105, 30, 0.6) 3px,
            rgba(210, 105, 30, 0.6) 4px
          );
          border-radius: 2px;
        }

        .rope::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0.3) 0%,
            transparent 50%,
            rgba(0,0,0,0.2) 100%
          );
          transform: translateX(-50%);
        }

        
        .rope-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          width: 1px;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            #A0522D 0px,
            #8B4513 2px,
            #D2691E 4px,
            #8B4513 6px
          );
          opacity: 0.7;
        }

        .rope-container::after {
          content: '';
          position: absolute;
          top: 0;
          right: -1px;
          width: 1px;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            #654321 0px,
            #8B4513 2px,
            #A0522D 4px,
            #654321 6px
          );
          opacity: 0.7;
        }
      `}</style>
    </>
  );
};

export default PlayerSidebar;
