import { useNavigate } from "react-router-dom";
import PlayerList from "../components/PlayerList";
import LobbyChat from "../components/LobbyChat";
import Panel from "../components/Panel";

const Lobby = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  return (
    <div className="flex flex-col justify-between min-h-0.5 p-6 overflow-hidden w-screen ">
      <Panel>
        <h1 className="text-4xl font-bold mb-6 text-white text-center">
          Sala de espera
        </h1>

        <div className="flex flex-grow w-full rounded-lg overflow-hidden shadow-lg">
          <div className="w-2/3 p-6 ">
            <PlayerList />
          </div>

          <div className="w-1/3 pr-1 pl-1 overflow-y-hidden">
            <LobbyChat />
          </div>
        </div>

        <button
          onClick={startGame}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
        >
          Iniciar partida
        </button>
      </Panel>
    </div>
  );
};

export default Lobby;
