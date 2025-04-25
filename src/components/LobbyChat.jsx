import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const LobbyChat = () => {
  const ws = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsubscribe = ws.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => unsubscribe();
  }, [ws]);

  const sendMessage = () => {
    if (input.trim()) {
      ws.send(input);
      //   setMessages((prev) => [...prev, input]);
      setInput("");
    }
  };

  return (
    <div
      className="max-h-[500px] overflow-y-auto space-y-2"
      style={{ padding: "20px" }}
    >
      <h2 className="text-2xl">Lobby Chat</h2>
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          style={{ border: "1px solid blue", padding: "10px" }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default LobbyChat;
