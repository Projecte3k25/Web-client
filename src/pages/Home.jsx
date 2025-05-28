import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import GameList from "../components/GameList";
import Panel from "../components/Panel";
import Ranking from "../components/Ranking";
import Sidebar from "../components/Sidebar";
import { useProfile } from "../context/ProfileContext";

const Home = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const ws = useWebSocket();
  const { profile, setProfile } = useProfile();
  const [reconnectData, setReconnectData] = useState(null);
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [game, setGame] = useState();
  const [players, setPlayers] = useState();
  const [fronteras, setFronteras] = useState();

  useEffect(() => {
    if (ws.socket && ws.socket.readyState === WebSocket.OPEN) {
      const rankingMessage = JSON.stringify({
        method: "getRanking",
        data: {},
      });
      ws.send(rankingMessage);

      const gamesMessage = JSON.stringify({
        method: "getPartidas",
        data: {},
      });
      ws.send(gamesMessage);
    }
  }, [ws.socket, ws.send]);

  useEffect(() => {
    const handleMessage = (event) => {
      // console.log(event);
      try {
        const message = JSON.parse(event.data);
        console.log(message);
        if (message.method === "getPartidas") {
          setGames(message.data);
        } else if (message.method === "lobby") {
          const { jugadors, partida } = message.data || {};
          navigate("/lobby", {
            state: {
              players: jugadors || [],
              game: partida || null,
            },
          });
        } else if (message.method === "profile") {
          setProfile(message.data);
          localStorage.setItem("profile", message.data.id);
        } else if (message.method === "getRanking") {
          if (Array.isArray(message.data)) {
            setRanking(message.data);
          }
        } else if (message.method === "reconnect") {
          setReconnectData(message);
          setShowReconnectModal(true);
          const info = message.data;

          setPlayers(info.jugadors);
          setGame(info.partida);
          setFronteras(info.fronteres);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.socket?.addEventListener("message", handleMessage);
    return () => {
      ws.socket?.removeEventListener("message", handleMessage);
    };
  }, [ws.socket, navigate, setProfile]);

  const handleIgnore = () => {
    setShowReconnectModal(false);
    setReconnectData(null);
    const leave = JSON.stringify({
      method: "leavePartida",
      data: {},
    });
    ws.send(leave);
  };
  const handleReconnect = () => {
    const partida = {
      jugadors: players,
      territoris: fronteras,
    };
    navigate("/game", {
      state: {
        partida,
        game,
        players,
      },
    });

    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Sidebar />
      <Panel>
        <div className="flex h-full gap-6">
          <div className="w-1/3 border-r border-white/30 pr-4 overflow-hidden">
            <Ranking ranking={ranking} />
          </div>
          <div className="w-2/3 pl-4 flex flex-col overflow-hidden">
            <GameList games={games} />
          </div>
        </div>
      </Panel>

      {showReconnectModal && reconnectData && (
        <div className="fixed inset-0   flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md text-center shadow-lg text-gray-950">
            <h3 className="text-xl font-semibold mb-4 text-gray-950">
              Vols tornar a la partida?
            </h3>
            <p className="mb-6 text-gray-950">
              Estaves en una partida activa. Pots tornar ara mateix.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-500 text-gray-950 px-4 py-2 rounded hover:bg-green-600"
                onClick={handleReconnect}
              >
                Sí, tornar
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleIgnore}
              >
                No, quedar-me aquí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
