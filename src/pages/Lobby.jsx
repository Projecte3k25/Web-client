import { useLocation, useNavigate } from "react-router-dom";
import PlayerList from "../components/PlayerList";
import LobbyChat from "../components/LobbyChat";
import Panel from "../components/Panel";
import { toast } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import messageHandlers from "../services/messageHandlers";
import { useProfile } from "../context/ProfileContext";
import EditGameModal from "../components/EditGameModal";

const Lobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useWebSocket();
  const { profile } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const initialPlayers = location.state?.players || [];
  const [players, setPlayers] = useState(initialPlayers);
  const [game, setGame] = useState(location.state?.game || null);
  const isCustomGame = game?.tipus === "Custom";
  const isAdmin = game?.admin_id === profile?.id;
  const shouldShowAdminControls = isCustomGame && isAdmin;

  // 🔒 Redirigir si no hay game
  useEffect(() => {
    if (!location.state?.game) {
      navigate("/home", { replace: true });
    }
  }, [location.state, navigate]);

  // 🔒 Redirigir si no hay perfil
  useEffect(() => {
    if (!profile) {
      navigate("/home");
    }
  }, [profile, navigate]);

  // console.log(game);
  useEffect(() => {
    if (initialPlayers.length === 0) {
      socket.send(JSON.stringify({ method: "lobby" }));
    }
  }, [socket]);

  useEffect(() => {
    const unsubscribe = socket.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);

        // Procesar mensajes lobby y joinPlayer normalmente
        const validMethods = ["lobby", "joinPlayer"];
        if (validMethods.includes(data.method)) {
          const handler = messageHandlers[data.method];
          if (handler) handler(data, setPlayers, setGame);
          return;
        }

        if (data.method === "startPartida") {
          console.log(data.data);
          navigate("/game", {
            state: {
              partida: data.data,
              game,
              players,
            },
          });
        }
        if (data.method === "kickJugador") {
          toast.error("Has estat expulsat de la partida " + game.nom);
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("Error al parsear mensaje:", err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket, game, players, navigate]);

  const handleAddBot = () => {
    const messageData = {
      method: "addBot",
      data: {},
    };
    socket.send(JSON.stringify(messageData));
  };
  const handleStartGame = () => {
    const message = JSON.stringify({
      method: "startPartida",
      data: {},
    });
    socket.send(message);
  };
  useEffect(() => {
    if (!profile) {
      navigate("/home");
    }
  }, [profile, navigate]);
  if (!game) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between min-h-0.5 p-6 overflow-hidden w-screen ">
      <Sidebar />
      <Panel>
        <h1 className="text-4xl font-bold mb-6 text-white text-center">
          {game.nom}
        </h1>

        <div className="flex flex-grow w-full rounded-lg overflow-hidden shadow-lg">
          <div className="w-2/3 p-6 relative">
            <PlayerList players={players} game={game} />
            {shouldShowAdminControls && (
              <>
                <button
                  onClick={handleStartGame}
                  className="absolute bottom-5 right-5 px-4 py-2 bg-yellow-400 hover:bg-yellow-800 text-black text-sm rounded-md shadow-lg transition-all cursor-pointer"
                >
                  Ready
                </button>
                <button
                  onClick={handleAddBot}
                  className="absolute bottom-5 left-30 px-4 py-2 bg-green-400 hover:bg-green-800 text-black text-sm rounded-md shadow-lg transition-all cursor-pointer"
                >
                  Add Bot
                </button>
                <button
                  className="absolute bottom-5 left-5 px-4 py-2 bg-red-400 hover:bg-red-800 text-black text-sm rounded-md shadow-lg transition-all cursor-pointer"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Editar
                </button>
              </>
            )}
          </div>

          <div className="w-1/3 pr-1 pl-1 overflow-y-hidden ">
            <LobbyChat players={players} />
          </div>
        </div>
      </Panel>
      {isEditModalOpen && game && (
        <EditGameModal game={game} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default Lobby;
