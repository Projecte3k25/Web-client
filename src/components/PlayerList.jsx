// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import useWebSocket from "../hooks/useWebSocket";
// import messageHandlers from "../services/messageHandlers";

import { Crown, CrownIcon, XCircle } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import useWebSocket from "../hooks/useWebSocket";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const PlayerList = ({ players, game }) => {
  const { profile } = useProfile();
  console.log(players);
  const socket = useWebSocket();
  return (
    <div className="max-h-[500px] overflow-y-auto space-y-2">
      <ul className="space-y-1">
        {players.map((player, index) => (
          <li
            key={index}
            className="flex items-center gap-4 p border border-blue-500 rounded-lg bg-gray-200/25 shadow-sm "
          >
            <img
              src={`http://${backendHost}${player.avatar}`}
              alt={`${player.nom}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-blue-900">
                    {player.nom}
                  </span>
                  {game?.admin_id === player.id && (
                    <img src="./crown.png" className="h-4 w-6"></img>
                  )}
                </div>
                {game?.admin_id === profile?.id &&
                  player.id !== profile?.id && (
                    <button
                      onClick={() =>
                        socket.send(
                          JSON.stringify({
                            method: "kickJugador",
                            data: { user: player.id },
                          })
                        )
                      }
                      className="text-red-600 hover:text-red-800 transition"
                      title="Expulsar jugador"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
              </div>
              <div className="text-sm  text-blue-900">
                Wins: {player.wins} · Elo: {player.elo}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
