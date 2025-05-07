import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import messageHandlers from "../services/messageHandlers";

const LobbyChat = () => {
  const ws = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsubscribe = ws.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);
        if (data.method === "newChatLobbyMessage") {
          const handler = messageHandlers[data.method];
          if (handler) {
            handler(data, setMessages);
          }
        }
      } catch (err) {
        console.error("Mensaje no es JSON válido:", err);
      }
    });

    return () => unsubscribe();
  }, [ws]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const messageData = {
        method: "newChatLobbyMessage",
        data: [
          {
            name: sessionStorage.getItem("playerName"),
            message: input,
          },
        ],
      };
      console.log(JSON.stringify(messageData));
      ws.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  return (
    <div
      className="max-h-[500px] overflow-y-auto space-y-2"
      style={{ padding: "20px" }}
    >
      <h2 className="text-2xl text-center">Lobby Chat</h2>
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.name}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <div className="flex" style={{ marginTop: "10px" }}>
        <input
          style={{
            border: "1px solid blue",
            padding: "10px",
            width: "100%",
          }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
        />
        {/* <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
          Enviar
        </button> */}
      </div>
    </div>
  );
};

export default LobbyChat;
