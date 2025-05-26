import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import "./index.css";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";
import Test from "./pages/Test.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import AppWrapper from "./context/AppWrapper.jsx";
import { Toaster } from "react-hot-toast";
import GameRoom from "./pages/GameRoom.jsx";
import EndGameScreen from "./pages/End.jsx";

const mockRanking = [
  {
    jugador: {
      id: "1",
      nom: "Lucía",
      avatar: "/avatars/lucia.png",
      wins: 12,
      games: 18,
      elo: 1430,
    },
    eloChange: +32,
  },
  {
    jugador: {
      id: "2",
      nom: "Carlos",
      avatar: "/avatars/carlos.png",
      wins: 10,
      games: 18,
      elo: 1390,
    },
    eloChange: +15,
  },
  {
    jugador: {
      id: "3",
      nom: "Marta",
      avatar: "/avatars/marta.png",
      wins: 9,
      games: 18,
      elo: 1370,
    },
    eloChange: -10,
  },
  {
    jugador: {
      id: "4",
      nom: "Tú",
      avatar: "/avatars/tu.png",
      wins: 8,
      games: 18,
      elo: 1350,
    },
    eloChange: -25,
  },
  {
    jugador: {
      id: "5",
      nom: "Leo",
      avatar: "/avatars/leo.png",
      wins: 6,
      games: 18,
      elo: 1300,
    },
    eloChange: +5,
  },
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WebSocketProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppWrapper>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lobby"
              element={
                <ProtectedRoute>
                  <Lobby />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <GameRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/end"
              element={
                <ProtectedRoute>
                  <EndGameScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/endtest"
              element={
                <EndGameScreen ranking={mockRanking} currentPlayerId="4" />
              }
            />
            <Route path="/test" element={<Test />} />
          </Routes>
        </AppWrapper>
      </BrowserRouter>
    </WebSocketProvider>
  </React.StrictMode>
);
