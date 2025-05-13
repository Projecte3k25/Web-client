import { Home, Settings, LogOut, User } from "lucide-react";
import useLogout from "../hooks/useLogout";
import useWebSocket from "../hooks/useWebSocket";
import { useNavigate } from "react-router-dom";
import ProfilePopup from "./ProfilePopup";
import { useState } from "react";

const Sidebar = () => {
  const logout = useLogout();
  const ws = useWebSocket();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const handleHome = () => {
    const message = JSON.stringify({
      method: "leavePartida",
      data: {},
    });

    ws.send(message);

    navigate("/home");
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-[3vw] mr-2 bg-gray-600/80 backdrop-blur-md border-r border-white/20 flex flex-col items-center justify-between py-6 z-50">
        <div className="flex flex-col space-y-6">
          <button title="Home" onClick={handleHome}>
            <Home className="text-gray-800 hover:text-green-400 transition-all cursor-pointer" />
          </button>
          <button title="Perfil" onClick={() => setShowProfile(true)}>
            <User className="text-gray-800 hover:text-green-400 transition-all cursor-pointer" />
          </button>
          <button title="Config">
            <Settings className="text-gray-800 hover:text-yellow-400 transition-all cursor-pointer" />
          </button>
        </div>

        <button title="Logout" onClick={logout}>
          <LogOut className="text-gray-800 hover:text-red-400 transition-all cursor-pointer" />
        </button>
      </div>
      {showProfile && <ProfilePopup onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Sidebar;
