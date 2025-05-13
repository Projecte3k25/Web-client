import { useNavigate } from "react-router-dom";
import useWebSocket from "./useWebSocket";

const useLogout = () => {
  const navigate = useNavigate();
  const ws = useWebSocket();

  const logout = () => {
    if (ws.socket?.readyState === WebSocket.OPEN) {
      ws.socket.close();
    }

    localStorage.clear();

    navigate("/");
  };

  return logout;
};

export default useLogout;
