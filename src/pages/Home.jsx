import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    if (!savedName) {
      navigate("/"); // si no está logueado, lo mandamos al login
    } else {
      setName(savedName);
    }
  }, [navigate]);

  const goToLobby = () => {
    navigate("/lobby");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Bienvenido, {name}</h2>
      <button onClick={goToLobby}>Entrar al Lobby</button>
    </div>
  );
};

export default Home;
