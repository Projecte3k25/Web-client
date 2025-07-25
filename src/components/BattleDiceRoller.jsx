import { useEffect, useState } from "react";
import DiceRoller from "./DiceRoller";
import useWebSocket from "../hooks/useWebSocket";

const getImageIndex = (troops, isAttacker) => {
  if (troops <= 2) return 1;
  if (troops === 3) return 2;
  if (troops === 4) return 3;
  if (troops <= 6) return 4;
  if (troops <= 8) return 5;
  if (troops === 9) return 6;
  if (troops <= 14) return 7;
  return 8; // 15 o más
};

const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

const BattleDiceRoller = ({
  atacanteId,
  defensorId,
  attackerTroops: initialAttackerTroops,
  defenderTroops,
  onClose,
  ultimaAccion,
}) => {
  const socket = useWebSocket();

  const [attackerTroops, setAttackerTroops] = useState(
    Math.max(1, initialAttackerTroops - 1)
  );
  const [localDefenderTroops, setLocalDefenderTroops] =
    useState(defenderTroops);
  const [hasRolled, setHasRolled] = useState(false);

  const redDiceCount = Math.max(1, Math.min(attackerTroops, 3));

  const blueDiceCount = Math.min(localDefenderTroops, 2);

  const [rollResults, setRollResults] = useState({ red: [], blue: [] });
  const [rollingTrigger, setRollingTrigger] = useState(0);

  const [troopAnimation, setTroopAnimation] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [conquistado, setConquistado] = useState(false);
  const [realAttackerTroops, setRealAttackerTroops] = useState(
    initialAttackerTroops
  );
  const [lostTroops, setLostTroops] = useState({ attacker: 0, defender: 0 });
  const [showLosses, setShowLosses] = useState(false);

  const handleRoll = () => {
    const message = JSON.stringify({
      method: "accio",
      data: {
        from: atacanteId,
        to: defensorId,
        tropas: attackerTroops,
      },
    });
    socket.send(message);
    setHasRolled(true);
  };

  useEffect(() => {
    if (!ultimaAccion || !hasMounted) {
      setHasMounted(true);
      return;
    }

    if (ultimaAccion.conquista) {
      setConquistado(true);
    }

    setRollResults({
      red: ultimaAccion.dausAtac,
      blue: ultimaAccion.dausDefensa,
    });

    setRealAttackerTroops((prev) =>
      Math.max(1, prev - ultimaAccion.atacTropas)
    );
    setLocalDefenderTroops((prev) => prev - ultimaAccion.defTropas);

    setAttackerTroops((prev) => {
      const newReal = Math.max(1, realAttackerTroops - ultimaAccion.atacTropas);
      const max = Math.max(1, newReal - 1);
      return Math.min(prev, max);
    });

    setLostTroops({
      attacker: ultimaAccion.atacTropas,
      defender: ultimaAccion.defTropas,
    });

    setRollingTrigger((prev) => prev + 1);
    setGifKey(Date.now());
    setShowGif(true);
    setTroopAnimation(true);
    setShowLosses(false);
    setHasRolled(true);

    const timeout = setTimeout(() => {
      setShowGif(false);
      setTroopAnimation(false);
      setShowLosses(true);

      setTimeout(() => {
        setShowLosses(false);
        setHasRolled(false);
        setRollResults({ red: [], blue: [] });
      }, 2000);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [ultimaAccion]);

  useEffect(() => {
    if (hasRolled) {
      const cleanup = setTimeout(() => {
        setShowGif(false);
        setTroopAnimation(false);
        setShowLosses(false);
        setHasRolled(false);
        setRollResults({ red: [], blue: [] });
      }, 7000);

      return () => clearTimeout(cleanup);
    }
  }, [hasRolled]);

  const attackerImageIndex = getImageIndex(attackerTroops, true);
  const defenderImageIndex = getImageIndex(localDefenderTroops, false);
  useEffect(() => {
    setHasRolled(false);
  }, [atacanteId, defensorId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6 p-14 bg-[#3b2a1a] border-[#8b4513] border-2  rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-hidden">
        <button
          className="absolute top-4 right-4 text-white font-bold text-xl cursor-pointer hover:text-gray-300 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex gap-10 w-full justify-center border-b-2 border-[#8b4513] pb-3">
          <div className="flex flex-col items-center ">
            <label className="font-bold text-[#f4e4bc]">
              Tropes atacants: {attackerTroops} de {atacanteId}
            </label>
            <input
              type="range"
              min={1}
              max={Math.max(1, realAttackerTroops - 1)}
              value={attackerTroops}
              onChange={(e) => setAttackerTroops(Number(e.target.value))}
              className="w-48 h-1 rounded-full appearance-none custom-thumb mt-2"
              style={{
                background: `linear-gradient(to right, #d4af37 ${
                  ((attackerTroops - 1) /
                    (Math.max(1, realAttackerTroops - 1) - 1)) *
                  100
                }%, #3b2a1a 0%)`,
              }}
              disabled={conquistado}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="font-bold text-[#f4e4bc]">
              Tropes defensores: {localDefenderTroops} de {defensorId}
            </label>
          </div>
        </div>

        {conquistado ? (
          <div className="text-[#d4af37] text-2xl font-bold mt-2">
            ¡Territori conquistat!
          </div>
        ) : (
          <button
            onClick={handleRoll}
            disabled={
              attackerTroops < 1 || localDefenderTroops < 1 || conquistado
            }
            className={`${
              attackerTroops < 1 || localDefenderTroops < 1 || conquistado
                ? "bg-gray-500 cursor-not-allowed"
                : " bg-[#3b2a1a] text-[#d4af37] border-[#8b4513] hover:bg-[#4a2c1a] border-2 rounded-2xl cursor-pointer"
            } text-[#d4af37]  px-6 py-2 rounded transition`}
          >
            Llançar daus
          </button>
        )}

        <div className="flex items-center justify-center gap-10 mt-4 relative">
          {/* Soldado atacante */}
          <img
            src={`./tropas/ataquer${attackerImageIndex}.png`}
            alt="Atacante"
            className={`w-64 h-64 transition-transform duration-700 ${
              troopAnimation ? "scale-125 -translate-x-12" : ""
            }`}
          />

          {/* Dados rojos */}
          <div className="flex flex-col items-center gap-4">
            {!hasRolled
              ? Array.from({ length: redDiceCount }).map((_, i) => (
                  <div
                    key={`placeholder-red-${i}`}
                    className="w-16 h-16 bg-red-300 rounded shadow-inner flex items-center justify-center text-white font-bold"
                  >
                    ?
                  </div>
                ))
              : rollResults.red.map((value, i) => (
                  <DiceRoller
                    key={`red-${i}-${rollingTrigger}`}
                    color="#E74C3C"
                    initialValue={value}
                    rollingTrigger={rollingTrigger}
                  />
                ))}
          </div>

          {/* Espadas GIF */}
          {/* {showGif && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <img
                src={`/effects/swords-crossed.gif?${gifKey}`}
                alt="Clash animation"
                className="w-64 h-64 pointer-events-none transition-opacity duration-500"
              />
            </div>
          )} */}

          {/* Resultado  */}
          {showLosses && (
            <div className="absolute bottom-30 left-1/2 transform -translate-x-1/2 z-50 bg-[#4a2c1a] bg-opacity-80  px-6 py-3 rounded-xl text-xl font-bold shadow-lg border border-[#8b4513]">
              <div className="flex flex-col items-center">
                {lostTroops.attacker > 0 && (
                  <p className="text-red-400">
                    Atacant perd -{lostTroops.attacker}
                  </p>
                )}
                {lostTroops.defender > 0 && (
                  <p className="text-blue-400">
                    Defensor perd -{lostTroops.defender}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dados azules */}
          <div className="flex flex-col items-center gap-4">
            {!hasRolled
              ? Array.from({ length: blueDiceCount }).map((_, i) => (
                  <div
                    key={`placeholder-blue-${i}`}
                    className="w-16 h-16 bg-blue-300 rounded shadow-inner flex items-center justify-center text-white font-bold"
                  >
                    ?
                  </div>
                ))
              : rollResults.blue.map((value, i) => (
                  <DiceRoller
                    key={`blue-${i}-${rollingTrigger}`}
                    color="#3498DB"
                    initialValue={value}
                    rollingTrigger={rollingTrigger}
                  />
                ))}
          </div>

          {/* Soldado defensor */}
          <img
            src={`./tropas/defender${defenderImageIndex}.png`}
            alt="Defensor"
            className={`w-64 h-64 transition-transform duration-700 ${
              troopAnimation ? "scale-125 translate-x-12" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default BattleDiceRoller;
