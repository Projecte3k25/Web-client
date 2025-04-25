import { useNavigate } from "react-router-dom";
import PlayerList from "../components/PlayerList";
import LobbyChat from "../components/LobbyChat";

const Lobby = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  return (
    <div className="flex flex-col justify-between min-h-0.5 p-6 overflow-hidden w-screen ">
      <h1 className="text-4xl font-bold mb-6 text-white text-center">
        Sala de espera
      </h1>

      <div className="flex flex-grow h-[500px] w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="w-2/3 p-6 border-r border-gray-700">
          <PlayerList />
        </div>

        <div className="w-1/3 pr-10 pl-10 h-[500px] overflow-y-hidden">
          <LobbyChat />
        </div>
      </div>

      <button
        onClick={startGame}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
      >
        Iniciar partida
      </button>
    </div>
  );
};

export default Lobby;
