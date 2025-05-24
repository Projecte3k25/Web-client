import { useState, useRef } from "react";
import { useProfile } from "../context/ProfileContext";

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const ProfilePopup = ({ onClose }) => {
  const { profile, updateProfile } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  if (!profile) return null;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen debe ser menor a 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`http://${backendHost}/api/profile/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include", // Si usas cookies para autenticación
        headers: {
          // No incluir Content-Type, el browser lo setea automáticamente para FormData
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Si usas JWT
        },
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();

      // Actualizar el perfil con la nueva imagen
      if (updateProfile) {
        updateProfile({ ...profile, avatar: data.avatarPath });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const winRate =
    profile.games > 0 ? ((profile.wins / profile.games) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0  bg-white/10 border-white/20 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-96 relative shadow-2xl transform animate-slideUp">
        {/* Botón cerrar mejorado */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110"
          onClick={onClose}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Avatar con funcionalidad de upload */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 p-1">
              {profile.avatar ? (
                <img
                  src={`http://${backendHost}${profile.avatar}`}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-gray-400">
                  {profile.nom?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Overlay para upload */}
            <div
              className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              onClick={triggerFileInput}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Error message */}
          {uploadError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200">
              {uploadError}
            </div>
          )}

          {/* Nombre del usuario */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.nom}
            </h2>
            <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              Haz clic en tu avatar para cambiarlo
            </p>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="w-full space-y-4">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.games ?? 0}
                </div>
                <div className="text-sm text-blue-700">Partidas</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.elo ?? 0}
                </div>
                <div className="text-sm text-purple-700">Elo Rating</div>
              </div>
            </div>

            {/* Wins/Losses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center border border-green-200">
                <div className="text-lg font-semibold text-green-600">
                  {profile.wins ?? 0}
                </div>
                <div className="text-xs text-green-700">Ganadas</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg text-center border border-red-200">
                <div className="text-lg font-semibold text-red-600">
                  {profile.loses ?? 0}
                </div>
                <div className="text-xs text-red-700">Perdidas</div>
              </div>
            </div>

            {/* Win Rate */}
            {profile.games > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg text-center border border-yellow-200">
                <div className="text-lg font-semibold text-orange-600">
                  {winRate}%
                </div>
                <div className="text-xs text-orange-700">Tasa de Victoria</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePopup;
