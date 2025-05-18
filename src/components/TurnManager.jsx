import { useEffect, useState } from "react";
import { Sword, ArrowsClockwise, ShieldCheck, Cards } from "phosphor-react";
import { SquaresPlusIcon } from "@heroicons/react/24/solid";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const posicioColors = {
  1: "#00913f",
  2: "#2196F3",
  3: "#FFEB3B",
  4: "#9C27B0",
  5: "#FF9800",
  6: "#c81d11",
};

const faseIcons = {
  ReforçTropes: ShieldCheck,
  Atac: Sword,
  Recolocacio: ArrowsClockwise,
};

const subFases = ["ReforçTropes", "Atac", "Recolocacio"];

export default function TurnManager({
  jugador,
  tiempoTotal,
  fase,
  tropasDisponibles,
  jugadores,
  cartas,
}) {
  const posi = jugadores?.find((e) => e.jugador.id === jugador.id)?.posicio;
  const [tiempoRestante, setTiempoRestante] = useState(tiempoTotal);

  const color = posicioColors[posi] || "#000";

  useEffect(() => {
    setTiempoRestante(tiempoTotal);
    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jugador.id, tiempoTotal]);

  const porcentaje = (tiempoRestante / tiempoTotal) * 100;
  const isSubFase = subFases.includes(fase);

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-amber-50/30 backdrop-blur-md shadow-lg rounded-xl p-4 w-52 z-50">
      <div className="text-center text-sm font-semibold text-gray-700 uppercase tracking-wide ">
        {isSubFase ? (
          <div className="flex gap-2 scale-[0.7]">
            {subFases.map((sfase) => {
              const Icon = faseIcons[sfase];
              const active = sfase === fase;
              return (
                <Icon
                  key={sfase}
                  size={18}
                  weight="fill"
                  color={active ? color : "#ccc"}
                  style={{ opacity: active ? 1 : 0.5 }}
                />
              );
            })}
          </div>
        ) : (
          fase
        )}
      </div>

      {/* Barra de tiempo */}
      <div className="relative w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full transition-all duration-300"
          style={{ width: `${porcentaje}%`, background: color }}
        />
      </div>

      {/* Info del jugador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={`http://${backendHost}${jugador.avatar}`}
            alt={jugador.nom}
            className="w-12 h-12 rounded-full border-2"
            style={{ borderColor: color }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{jugador.nom}</span>
            <span className="text-sm text-gray-600">
              Tropas: {tropasDisponibles}
            </span>
          </div>
        </div>

        {/* Botón de cartas */}
        {isSubFase && (
          <div className="flex flex-col items-center gap-1">
            <button
              className="p-1 hover:bg-gray-200 rounded-md transition"
              disabled={!cartas?.length}
              title="Cartas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                width="30"
                height="30"
                className={`transition-all ${
                  cartas?.length > 0 ? "grayscale-0" : "grayscale opacity-40"
                }`}
              >
                <path d="M12 8h40v48H12z" opacity="0.3" />
                <path
                  d="M10 6h44v52H10z"
                  stroke="#000"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M20 12h24v8H20z" fill="#000" />
                <circle cx="32" cy="40" r="6" fill="#000" />
              </svg>
            </button>
            <span className="text-[10px] text-gray-600 font-medium">mà</span>
          </div>
        )}
      </div>

      {/* Botón de acción */}
      {isSubFase && (
        <button
          className="w-full py-2 text-white font-semibold rounded-lg shadow"
          style={{
            backgroundColor: color,
          }}
        >
          {fase === "Recolocacio" ? "Terminar turno" : "Siguiente"}
        </button>
      )}
    </div>
  );
}
