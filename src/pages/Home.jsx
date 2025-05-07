import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import GameList from "../components/GameList";
import Panel from "../components/Panel";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const ws = useWebSocket();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const savedName = sessionStorage.getItem("playerName");

    if (!token) {
      navigate("/");
      return;
    }

    setName(savedName);

    const backendHost = import.meta.env.VITE_BACKEND_HOST_WS;

    // ⚠️ Conecta si el socket aún no existe o está cerrado
    if (!ws.socket || ws.socket.readyState === WebSocket.CLOSED) {
      ws.connect(`ws://${backendHost}/`);
    }

    const sendLogin = () => {
      const message = JSON.stringify({
        method: "login",
        data: { token: token },
      });
      ws.send(message);
      console.log("Mensaje de login enviado por WebSocket:", message);
    };

    if (ws.socket?.readyState === WebSocket.OPEN) {
      sendLogin();
    } else {
      const onOpen = () => {
        sendLogin();
        ws.socket.removeEventListener("open", onOpen);
      };
      ws.socket?.addEventListener("open", onOpen);
    }
  }, [navigate]);

  // const goToLobby = () => {
  //   navigate("/lobby");
  // };

  return (
    <div className="flex flex-col justify-between min-h-0.5 p-6 overflow-hidden w-screen">
      <Panel>
        <h2 className="text-xl text-gray-950 ">Benvingut, {name}</h2>
        <GameList />
        {/* <button onClick={goToLobby}>Entrar al Lobby</button> */}
      </Panel>
    </div>
  );
};

export default Home;
