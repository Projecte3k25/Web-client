import React from "react";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const posicioColors = {
  1: "#00913f", // verde
  2: "#2196F3", // azul
  3: "#FFEB3B", // amarillo
  4: "#9C27B0", // morado
  5: "#FF9800", // naranja
  6: "#c81d11", // rojo
};

const LoadingScreen = ({ players, gameName, loadedIds }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Partida: {gameName}</h1>
      <p className="mb-8 text-lg">
        Esperando a que todos los jugadores carguen el mapa...
      </p>

      <div className="w-full max-w-md space-y-4">
        {players.map((player, index) => {
          const isLoaded =
            loadedIds.includes(player.jugador.id) || player.jugador.id === 0;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800 shadow"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: posicioColors[player.posicio] || "#aaa",
                  }}
                />
                <img
                  src={`http://${backendHost}${player.jugador.avatar}`}
                  alt="avatar"
                  className="w-16 h-16 rounded-full"
                />
                <span className="font-medium">{player.jugador.nom}</span>
                {isLoaded && (
                  <span className="ml-2 text-green-400 text-sm">✅ Listo</span>
                )}
              </div>
              <span className="text-sm text-gray-400">
                ELO: {player.jugador.elo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScreen;
