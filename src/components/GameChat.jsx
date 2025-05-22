import { useEffect, useRef, useState } from "react";

// Mapa de colores por posición
const posicioColors = {
  1: "#00913f", // verde
  2: "#2196F3", // azul
  3: "#FFEB3B", // amarillo
  4: "#9C27B0", // morado
  5: "#FF9800", // naranja
  6: "#c81d11", // rojo
};

const GameChat = ({ players, ws, onSystemMessage }) => {
  const [messages, setMessages] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "system"
  const [userCache, setUserCache] = useState({});
  const hideTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageCounterRef = useRef(0); // Usar ref para mantener el contador
  // console.log(players);
  // Función para generar ID único
  const generateUniqueId = () => {
    messageCounterRef.current += 1;
    return `msg_${Date.now()}_${messageCounterRef.current}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  const showChat = () => {
    setIsVisible(true);
    resetHideTimer();
  };

  const resetHideTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 20000);
  };

  // Auto scroll al final de los mensajes
  //   const scrollToBottom = () => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   };

  //   useEffect(() => {
  //     scrollToBottom();
  //   }, [messages, systemMessages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!isVisible) {
        showChat();
      } else if (input.trim()) {
        e.preventDefault();
        sendMessage(input.trim());
        setInput("");
        resetHideTimer();
      }
    }
  };

  const sendMessage = (message) => {
    if (ws && ws.send) {
      ws.send(
        JSON.stringify({
          method: "chat",
          data: { message },
        })
      );
    }
  };

  // Función para agregar mensaje del sistema
  const addSystemMessage = (message) => {
    const systemMsg = {
      id: generateUniqueId(),
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      system: true,
    };

    setSystemMessages((prev) => {
      // Evitar duplicados basados en texto y timestamp reciente
      const isDuplicate = prev.some(
        (msg) =>
          msg.text === systemMsg.text &&
          Math.abs(
            new Date(`1970-01-01T${msg.timestamp}`) -
              new Date(`1970-01-01T${systemMsg.timestamp}`)
          ) < 1000
      );

      if (isDuplicate) {
        return prev;
      }

      return [...prev, systemMsg];
    });
  };

  // Exponer función al componente padre de forma segura
  useEffect(() => {
    if (onSystemMessage) {
      onSystemMessage(addSystemMessage);
    }
  }, [onSystemMessage]);

  // Recibir mensajes de chat
  useEffect(() => {
    if (!ws || !ws.onMessage) return;

    const unsubscribe = ws.onMessage((rawData) => {
      try {
        const data = JSON.parse(rawData);
        if (data.method === "chat") {
          const userId = data.data.user;

          // Cachear información del usuario
          if (!userCache[userId]) {
            const playerData = players.find((p) => p.jugador.id === userId);
            if (playerData) {
              setUserCache((prev) => ({
                ...prev,
                [userId]: {
                  nom: playerData.jugador.nom,
                  posicio: playerData.posicio,
                },
              }));
            }
          }

          // Agregar mensaje de chat
          const newMessage = {
            id: generateUniqueId(),
            user: userId,
            message: data.data.message,
            timestamp: new Date().toLocaleTimeString(),
            system: false,
          };

          setMessages((prev) => {
            // Evitar duplicados de mensajes de chat
            const isDuplicate = prev.some(
              (msg) =>
                msg.user === newMessage.user &&
                msg.message === newMessage.message &&
                Math.abs(
                  new Date(`1970-01-01T${msg.timestamp}`) -
                    new Date(`1970-01-01T${newMessage.timestamp}`)
                ) < 1000
            );

            if (isDuplicate) {
              return prev;
            }

            return [...prev, newMessage];
          });
        }
      } catch (err) {
        console.error("Mensaje inválido:", err);
      }
    });

    return () => unsubscribe();
  }, [ws, players, userCache]);

  // Control global de tecla "Enter"
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, input]);

  const currentMessages = activeTab === "system" ? systemMessages : messages;

  return (
    <div
      className={`fixed top-2 left-2 w-[250px] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      } z-50`}
    >
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm border border-gray-600">
        {/* Tabs */}
        <div className="flex space-x-2 mb-2">
          <button
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "chat"
                ? "bg-blue-600/50 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            Chat ({messages.length})
          </button>
          <button
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "system"
                ? "bg-blue-600/50 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
            onClick={() => setActiveTab("system")}
          >
            Sistema ({systemMessages.length})
          </button>
        </div>

        {/* Mensajes */}
        <div className="max-h-48 overflow-y-auto mb-2 border-t border-gray-600 pt-2">
          {currentMessages.length === 0 ? (
            <p className="text-gray-400 italic text-center py-2">
              {activeTab === "chat"
                ? "No hay mensajes"
                : "No hay acciones registradas"}
            </p>
          ) : (
            currentMessages.map((msg) => {
              if (msg.system || activeTab === "system") {
                return (
                  <div key={msg.id} className="mb-1">
                    <span className="text-xs text-gray-400">
                      [{msg.timestamp}]{" "}
                    </span>
                    <span className="text-yellow-300">{msg.text}</span>
                  </div>
                );
              }

              const userData =
                userCache[msg.user] ||
                (() => {
                  const p = players.find((p) => p.jugador.id === msg.user);
                  return p
                    ? {
                        nom: p.jugador.nom,
                        posicio: p.posicio,
                      }
                    : { nom: `Usuario${msg.user}`, posicio: null };
                })();

              const color = posicioColors[userData.posicio] || "#ccc";

              return (
                <div key={msg.id} className="mb-1 break-words">
                  <span className="text-xs text-gray-400">
                    [{msg.timestamp}]{" "}
                  </span>
                  <strong style={{ color }}>{userData.nom}:</strong>{" "}
                  <span className="text-gray-100">{msg.message}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input solo visible en tab de chat */}
        {activeTab === "chat" && (
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded focus:outline-none focus:border-blue-500 placeholder-gray-400"
            placeholder="Presiona Enter para escribir..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={resetHideTimer}
          />
        )}

        <div className="text-xs text-gray-400 mt-1 text-center">
          Presiona Enter para {isVisible ? "enviar" : "abrir chat"}
        </div>
      </div>
    </div>
  );
};

export default GameChat;
