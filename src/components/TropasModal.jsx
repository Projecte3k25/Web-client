import React, { useState, useEffect } from "react";

export default function TropasModal({
  isOpen,
  mode, // 'reforc' o 'recolocacio'
  territorioFrom,
  territorioTo,
  tropasDisponibles,
  fromTropas,
  onClose,
  onConfirm,
}) {
  const [valor, setValor] = useState(1);

  // Reiniciar el valor cuando cambian los territorios, el modo o cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setValor(1);
    }
  }, [territorioFrom, territorioTo, mode, isOpen]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  const maxRange =
    mode === "reforc"
      ? Math.max(tropasDisponibles, 1)
      : Math.max(fromTropas - 1, 1);

  const handleConfirm = () => {
    onConfirm(valor);
    onClose();
  };

  const handleCancel = () => {
    // Asegurarnos de que onClose se ejecute correctamente
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Esto impide que se cierre el modal si el clic es en el overlay
    if (e.target === e.currentTarget) {
      e.stopPropagation(); // Detiene la propagación del evento
      e.preventDefault(); // Previene cualquier comportamiento predeterminado
    }
  };

  const getTituloModal = () => {
    return mode === "reforc"
      ? `Reforzar territorio: ${territorioFrom}`
      : `Mover tropas: ${territorioFrom} → ${territorioTo}`;
  };

  const getDescripcionAccion = () => {
    if (mode === "reforc") {
      return (
        <div className="flex items-center justify-center">
          <span>
            Asignar <span className="font-bold text-amber-400">{valor}</span>{" "}
            nuevas tropas
          </span>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <div className="text-right">
            <span>
              Quedan en {territorioFrom}:{" "}
              <span className="font-bold">{fromTropas - valor}</span>
            </span>
          </div>
          <div className="text-right">
            <span>
              Recibe {territorioTo}:{" "}
              <span className="font-bold text-blue-500">{valor}</span>
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm "
      onClick={handleOverlayClick}
    >
      <div
        className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-5 w-72 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-center text-white border-b border-gray-800 pb-2">
          {getTituloModal()}
        </h2>

        <div className="space-y-4 py-1">
          <div className="flex justify-between text-gray-300 text-xs px-1">
            <span>1</span>
            <span>{maxRange}</span>
          </div>
          <input
            type="range"
            min={1}
            max={maxRange}
            value={valor}
            onChange={(e) => setValor(parseInt(e.target.value))}
            className="w-full accent-amber-500 h-1 rounded-lg appearance-none cursor-pointer bg-gray-700"
          />

          <div className="text-center mt-2 bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm">
            {getDescripcionAccion()}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          {/* <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200 text-sm"
          >
            Cancelar
          </button> */}
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors duration-200 text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
