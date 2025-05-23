import React, { useState, useEffect } from "react";

export default function TropasModal({
  isOpen,
  mode,
  territorioFrom,
  territorioTo,
  tropasDisponibles,
  fromTropas,
  onClose,
  onConfirm,
}) {
  const [valor, setValor] = useState(1);

  useEffect(() => {
    if (isOpen) setValor(1);
  }, [territorioFrom, territorioTo, mode, isOpen]);

  if (!isOpen) return null;

  const maxRange =
    mode === "reforc"
      ? Math.max(tropasDisponibles, 1)
      : Math.max(fromTropas - 1, 1);

  const handleConfirm = () => {
    onConfirm(valor);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const getTituloModal = () => {
    return mode === "reforc"
      ? `Reforzar territorio: ${territorioFrom}`
      : `Mover tropas: ${territorioFrom} → ${territorioTo}`;
  };

  const getDescripcionAccion = () => {
    return mode === "reforc" ? (
      <div className="text-center">
        Asignar <span className="font-bold text-amber-400">{valor}</span> nuevas
        tropas
      </div>
    ) : (
      <div className="space-y-2 text-sm text-right">
        <div>
          Quedan en <span className="text-yellow-300">{territorioFrom}</span>:{" "}
          <span className="font-bold">{fromTropas - valor}</span>
        </div>
        <div>
          Recibe <span className="text-blue-400">{territorioTo}</span>:{" "}
          <span className="font-bold">{valor}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="trade-popup-overlay" onClick={handleOverlayClick}>
      <div
        className="trade-popup"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "350px" }}
      >
        <div className="trade-popup-header">
          <h3>{getTituloModal()}</h3>
        </div>

        <div className="trade-popup-content">
          <div>
            <div className="flex justify-between text-xs text-[#f4e4bc] px-1">
              <span>1</span>
              <span>{maxRange}</span>
            </div>
            <input
              type="range"
              min={1}
              max={maxRange}
              value={valor}
              onChange={(e) => setValor(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-[#8b4513] accent-[#d4af37] cursor-pointer"
            />
          </div>

          <div className="bg-[rgba(139,69,19,0.2)] border border-[#8b4513] rounded-lg p-3 text-sm text-[#f4e4bc]">
            {getDescripcionAccion()}
          </div>
        </div>

        <div className="trade-popup-actions">
          <button onClick={handleConfirm} className="trade-button">
            Confirmar
          </button>
          {/* <button onClick={onClose} className="cancel-button">
            Cancelar
          </button> */}
        </div>
      </div>
    </div>
  );
}
