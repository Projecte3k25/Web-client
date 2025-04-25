import { useEffect, useRef, useState } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    // Conexión al WebSocket de Ratchet ip luego 10.225.0.240
    ws.current = new WebSocket("ws://localhost:8080/chat");

    ws.current.onopen = () => {
      console.log("Conectado al servidor WebSocket");
    };

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.log("Conexión cerrada");
    };

    // Cleanup al desmontar
    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && input.trim() !== "") {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat con Ratchet</h2>
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          height: "200px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
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

export default Chat;
