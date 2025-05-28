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
          </Routes>
        </AppWrapper>
      </BrowserRouter>
    </WebSocketProvider>
  </React.StrictMode>
);
