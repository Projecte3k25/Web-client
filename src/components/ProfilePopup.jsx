import { useProfile } from "../context/ProfileContext";
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const ProfilePopup = ({ onClose }) => {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 relative shadow-lg">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex flex-col items-center space-y-4">
          {profile.avatar && (
            <img
              src={`http://${backendHost}${profile.avatar}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full"
            />
          )}
          <h2 className="text-xl font-semibold text-gray-900">{profile.nom}</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Partidas totals: {profile.games ?? 0}</p>
            <p>Ganadas: {profile.wins ?? 0}</p>
            <p>Perdidas: {profile.loses ?? 0}</p>
            <p>Elo: {profile.elo ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
