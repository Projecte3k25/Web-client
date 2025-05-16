import { useEffect, useState } from "react";

export default function TurnManager({
  jugador,
  tiempoTotal,
  fase,
  tropasDisponibles,
}) {
  const [tiempoRestante, setTiempoRestante] = useState(tiempoTotal);
  const color = posicioColors[jugador.posicio] || "#000";

  useEffect(() => {
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
  }, [tiempoTotal]);

  const porcentaje = (tiempoRestante / tiempoTotal) * 100;

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-amber-50/60 backdrop-blur-md shadow-lg rounded-xl p-4 w-64 z-50">
      <div className="text-center text-sm font-semibold mb-2 text-gray-700 uppercase tracking-wide">
        {fase}
      </div>

      <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
          style={{ width: `${porcentaje}%`, background: color }}
        />
      </div>

      <div className="flex items-center gap-3">
        <img
          src={jugador.user.avatar}
          alt={jugador.user.nom}
          className="w-12 h-12 rounded-full border-2"
          style={{ borderColor: posicioColors[jugador.posicio] }}
        />
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{jugador.user.nom}</span>
          <span className="text-sm text-gray-600">
            Tropas: {tropasDisponibles}
          </span>
        </div>
      </div>
    </div>
  );
}
const posicioColors = {
  1: "#00913f", // verde
  2: "#2196F3", // azul
  3: "#FFEB3B", // amarillo
  4: "#9C27B0", // morado
  5: "#FF9800", // naranja
  6: "#c81d11", //rojo
};
