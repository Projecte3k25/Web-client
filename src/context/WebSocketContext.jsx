import { createContext } from "react";
import WebSocketService from "../services/WebSocketService";

const WebSocketContext = createContext(WebSocketService);

export const WebSocketProvider = ({ children }) => {
  return (
    <WebSocketContext.Provider value={WebSocketService}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
