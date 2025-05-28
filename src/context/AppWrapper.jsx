import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import { ProfileProvider } from "./ProfileContext";
import { toast } from "react-hot-toast";

const AppWrapper = ({ children }) => {
  const ws = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const backendHost = import.meta.env.VITE_BACKEND_HOST_WS;
    const isLoginRoute = location.pathname === "/";

    //  Redirigir si ya estaba logueado y viene por recarga
    if (isLoginRoute && token) {
      navigate("/home");
      return;
    }

    //  Si estamos en login, desconectamos el socket
    if (isLoginRoute) {
      if (ws.socket?.readyState === WebSocket.OPEN) {
        ws.socket.close();
      }
      return;
    }

    if (!token) return;

    //  Añadir graceful_reload para avisar antes de cerrar o recargar
    const handleBeforeUnload = () => {
      if (ws.socket?.readyState === WebSocket.OPEN) {
        const gameId = localStorage.getItem("currentGameId");
        ws.send(
          JSON.stringify({
            type: "graceful_reload",
            token,
            gameId,
          })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Verificamos si es login o reconexión automática
    const isFreshLogin = localStorage.getItem("freshLogin") === "true";
    const isReconnect = !isFreshLogin;

    const connectWebSocket = () => {
      if (!ws.socket || ws.socket.readyState === WebSocket.CLOSED) {
        ws.connect(`ws://${backendHost}/`);

        const sendLogin = () => {
          const message = JSON.stringify({
            method: "login",
            data: { token, isReconnect },
          });
          ws.send(message);
          localStorage.removeItem("freshLogin");
        };

        if (ws.socket?.readyState === WebSocket.OPEN) {
          sendLogin();
        } else {
          const onOpen = () => {
            sendLogin();
            ws.socket?.removeEventListener("open", onOpen);
          };
          ws.socket?.addEventListener("open", onOpen);
        }
      }
    };

    connectWebSocket();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location.pathname, ws, navigate]);

  useEffect(() => {
    if (!ws.socket) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.method === "error" && message.data?.message) {
          toast.error(message.data.message);
          // alert(message.data.message);
        }
      } catch (e) {
        console.error("Error parsing global WS message", e);
      }
    };

    ws.socket.addEventListener("message", handleMessage);
    return () => {
      // Verificar que ws.socket sigue existiendo antes de remover el listener
      if (ws.socket) {
        ws.socket.removeEventListener("message", handleMessage);
      }
    };
  }, [ws.socket]);

  return <ProfileProvider>{children}</ProfileProvider>;
};

export default AppWrapper;
