// src/components/CreateGameModal.jsx
import { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const CreateGameModal = ({ onClose }) => {
  const socket = useWebSocket();
  const [nom, setNom] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // const data = {
    //   max_players: maxPlayers,
    //   password: password,
    //   nom,
    // };

    socket.send(
      JSON.stringify({
        method: "createPartida",
        data: {
          max_players: maxPlayers,
          password: password,
          nom: nom,
        },
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-xl space-y-4 w-96"
      >
        <h2 className="text-xl font-bold text-center text-gray-800">
          Crear nueva partida
        </h2>

        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded text-black"
          placeholder="Nombre de la partida"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />

        <input
          type="number"
          min={2}
          max={6}
          className="w-full p-2 border border-gray-300 rounded text-black"
          placeholder="Máximo de jugadores"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          required
        />

        <label className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Partida privada
        </label>

        {isPrivate && (
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-red-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGameModal;
