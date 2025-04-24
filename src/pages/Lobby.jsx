import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  const players = [
    { id: 1, name: "Jugador 1" },
    { id: 2, name: "Jugador 2" },
  ];

  return (
    <div>
      <h2>Sala de espera</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      <button onClick={startGame}>Iniciar partida</button>
    </div>
  );
};
export default Lobby;
