import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";
import Panel from "../components/Panel";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
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
      alert("Revisa les credencials");
    }
  };

  const handleDiscordClick = () => {
    const discordInvite = "https://discord.gg/HBJKArd8";
    window.open(discordInvite, "_blank");
  };

  const handlePdfClick = () => {
    const pdfUrl = `http://${backendHost}/assets/documents/Risk-Game.pdf`;
    window.open(pdfUrl, "_blank");
  };

  return (
    <Panel className="flex justify-center items-center">
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Login</h2>
          <div style={styles.face}>{face}</div>
          <div onSubmit={handleSubmit}>
            <div style={styles.inputBox}>
              <input
                type="text"
                id="username"
                value={login}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <label
                style={{
                  ...styles.label,
                  ...(login ? styles.labelActive : {}),
                }}
              >
                Username
              </label>
            </div>
            <div style={styles.inputBox}>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <label
                style={{
                  ...styles.label,
                  ...(password ? styles.labelActive : {}),
                }}
              >
                Password
              </label>
            </div>
            <button
              onClick={handleSubmit}
              style={{
                ...styles.loginBtn,
                ...(login && password
                  ? styles.loginBtnEnabled
                  : styles.loginBtnDisabled),
              }}
              disabled={!(login && password)}
            >
              Entrar
            </button>
          </div>
        </div>

        <div style={styles.additionalButtons}>
          <button
            type="button"
            onClick={handleDiscordClick}
            style={styles.discordBtn}
            onMouseEnter={(e) =>
              (e.target.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            <img src="./discord.png" alt="discord" className="pl-2" />
            Uneix-te a la comunitat
          </button>

          <button
            type="button"
            onClick={handlePdfClick}
            style={styles.pdfBtn}
            onMouseEnter={(e) =>
              (e.target.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            <img src="./pdf.png" alt="pdf" className="pl-2" />
            Manual del RISK GAME
          </button>
        </div>
      </div>
    </Panel>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start",
    minHeight: "100vh",
    padding: "20px",
  },
  loginBox: {
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    width: "400px",
    maxWidth: "90vw",
    textAlign: "center",
    animation: "fadeIn 1.2s ease",
    position: "relative",
    marginBottom: "20px",
  },
  title: {
    color: "white",
    marginBottom: "10px",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  face: {
    fontSize: "3rem",
    marginBottom: "20px",
    transition: "0.3s ease",
  },
  inputBox: {
    position: "relative",
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "12px 10px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid white",
    outline: "none",
    color: "white",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  label: {
    position: "absolute",
    left: "10px",
    top: "12px",
    color: "white",
    pointerEvents: "none",
    transition: "0.3s ease",
    fontSize: "1rem",
  },
  labelActive: {
    top: "-12px",
    left: "5px",
    fontSize: "0.8rem",
    color: "#00ffe5",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    outline: "none",
    fontWeight: "bold",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    fontSize: "1rem",
  },
  loginBtnEnabled: {
    background: "#00ffe5",
    color: "black",
    boxShadow: "0 0 10px #00ffe5, 0 0 40px rgba(0, 255, 229, 0.3)",
  },
  loginBtnDisabled: {
    background: "#888",
    color: "#ccc",
    cursor: "not-allowed",
  },
  additionalButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  discordBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5865F2",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(88, 101, 242, 0.3)",
    minWidth: "120px",
  },
  pdfBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC3545",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
    minWidth: "120px",
  },
};

export default Login;
