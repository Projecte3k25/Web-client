import { createContext, useEffect } from "react";
import WebSocketService from "../services/WebSocketService";
// import WebSocketService from "../services/WebSocketService";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  useEffect(() => {
    WebSocketService.connect("ws://localhost:8080/chat");
  }, []);

  return (
    <WebSocketContext.Provider value={WebSocketService}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
