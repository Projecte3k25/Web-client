import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [face, setFace] = useState("😐");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "username") setLogin(value);
    if (id === "password") setPassword(value);
    if (value.trim() !== "" && login.trim() !== "" && password.trim() !== "") {
      setFace("😊");
    } else {
      setFace("😐");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
      console.log(backendHost);
      const response = await fetch(`http://${backendHost}/api/usuaris/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("playerName", login);
      localStorage.setItem("freshLogin", "true");
      setFace("🎉");
      navigate("/home");
    } catch (error) {
      console.error(error);
      setFace("😢");
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-box">
      <h2 className="text-3xl bold">Login</h2>
      <div id="face">{face}</div>
      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="input-box">
          <input
            type="text"
            id="username"
            value={login}
            onChange={handleInputChange}
            required
          />
          <label>Username</label>
        </div>
        <div className="input-box">
          <input
            type="password"
            id="password"
            value={password}
            onChange={handleInputChange}
            required
          />
          <label>Password</label>
        </div>
        <button type="submit" id="loginBtn" disabled={!(login && password)}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
