import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (name.trim() === "") return;
    localStorage.setItem("playerName", name); // lo guardamos para usarlo después
    navigate("/home");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Ingresá tu nombre</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jugador..."
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
