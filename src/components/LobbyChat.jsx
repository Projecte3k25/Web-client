import { useEffect, useState, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";
import messageHandlers from "../services/messageHandlers";

const LobbyChat = ({ players }) => {
  const ws = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
  const [userCache, setUserCache] = useState({});
  const prevPlayersRef = useRef([]);

  // Detectar entradas y salidas de jugadores
  useEffect(() => {
    const prevPlayers = prevPlayersRef.current;
    const prevIds = new Set(prevPlayers.map((p) => p.id));
    const currentIds = new Set(players.map((p) => p.id));

    // Detectar uniones
    players.forEach((p) => {
      if (!prevIds.has(p.id)) {
        setMessages((prev) => [
          ...prev,
          { system: true, text: `${p.nom} se ha unido al lobby.` },
        ]);
      }
    });

    // Detectar salidas
    prevPlayers.forEach((p) => {
      if (!currentIds.has(p.id)) {
        setMessages((prev) => [
          ...prev,
          { system: true, text: `${p.nom} ha salido del lobby.` },
        ]);
      }
    });

    prevPlayersRef.current = players;
  }, [players]);

  // Recibir mensajes
  useEffect(() => {
    const unsubscribe = ws.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);
        if (data.method === "chat") {
          const userId = data.data.user;

          // Si no está cacheado, lo metemos
          if (!userCache[userId]) {
            const playerData = players.find((p) => p.id === userId);
            if (playerData) {
              setUserCache((prev) => ({
                ...prev,
                [userId]: {
                  nom: playerData.nom,
                  avatar: playerData.avatar,
                },
              }));
            }
          }

          const handler = messageHandlers[data.method];
          if (handler) handler(data, setMessages);
        }
      } catch (err) {
        console.error("Mensaje no es JSON válido:", err);
      }
    });
    return () => unsubscribe();
  }, [ws, players, userCache]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const messageData = {
        method: "chat",
        data: {
          message: input,
        },
      };
      ws.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  return (
    <div
      className="max-h-[500px] overflow-y-auto space-y-2"
      style={{ padding: "20px" }}
    >
      <h2 className="text-2xl text-center">Xat de Sala</h2>
      <div className="border border-gray-300 p-3 h-[300px] overflow-y-scroll">
        {messages.map((msg, i) => {
          if (msg.system) {
            return (
              <p key={i} className="text-sm italic text-gray-800">
                {msg.text}
              </p>
            );
          }

          const userData =
            userCache[msg.user] || players.find((p) => p.id === msg.user) || {};
          const { nom, avatar } = userData;

          return (
            <div
              key={i}
              className="flex items-center space-x-2 mb-2 text-black"
            >
              {avatar && (
                <img
                  src={`http://${backendHost}${avatar}`}
                  alt={nom || "Avatar"}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <p>
                <strong className="text-red-900">{nom || msg.user}:</strong>{" "}
                {msg.message}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex" style={{ marginTop: "10px" }}>
        <input
          style={{ border: "1px solid blue", padding: "10px", width: "100%" }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
        />
      </div>
    </div>
  );
};

export default LobbyChat;
