import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import GameBoard from "./pages/GameBoard.jsx";
import "./index.css";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<GameBoard />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  </React.StrictMode>
);
