import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import GameList from "../components/GameList";
import Panel from "../components/Panel";
import Ranking from "../components/Ranking";
import Sidebar from "../components/Sidebar";
import { useProfile } from "../context/ProfileContext";

const Home = () => {
  const navigate = useNavigate();
  const ws = useWebSocket();
  const { profile, setProfile } = useProfile();
  const [reconnectData, setReconnectData] = useState(null);
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.method === "profile") {
          setProfile(message.data);
        } else if (message.type === "reconnect_offer") {
          setReconnectData(message);
          setShowReconnectModal(true);
        } else if (message.method === "getRanking") {
          if (Array.isArray(message.data)) {
            setRanking(message.data);
          }
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.socket?.addEventListener("message", handleMessage);
    return () => {
      ws.socket?.removeEventListener("message", handleMessage);
    };
  }, [ws.socket]);

  const handleIgnore = () => {
    setShowReconnectModal(false);
    setReconnectData(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Sidebar />
      <Panel>
        <div className="flex h-130 gap-6">
          <div className="w-1/3 border-r border-white/30 pr-6">
            <Ranking ranking={ranking} />
          </div>
          <div className="w-2/3 pl-6 flex flex-col justify-between">
            <div>
              <GameList />
            </div>
          </div>
        </div>
      </Panel>

      {showReconnectModal && reconnectData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Vols tornar a la partida?
            </h3>
            <p className="mb-6">
              Estaves en una partida activa. Pots tornar ara mateix.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
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
