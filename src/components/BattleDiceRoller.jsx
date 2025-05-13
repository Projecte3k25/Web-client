import { useState } from "react";
import DiceRoller from "./DiceRoller";
// import "./css/Battle.css";
// Función que devuelve el índice de imagen en base a las tropas
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

const BattleDiceRoller = () => {
  const [attackerTroops, setAttackerTroops] = useState(5);
  const [defenderTroops, setDefenderTroops] = useState(3);

  const redDiceCount = Math.min(attackerTroops - 1, 3);
  const blueDiceCount = Math.min(defenderTroops, 2);

  const [rollResults, setRollResults] = useState({ red: [], blue: [] });
  const [rollingTrigger, setRollingTrigger] = useState(0);

  const [troopAnimation, setTroopAnimation] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showResult, setShowResult] = useState("");
  const [gifKey, setGifKey] = useState(0);

  const handleRoll = () => {
    const redRolls = Array.from(
      { length: redDiceCount },
      () => Math.floor(Math.random() * 6) + 1
    );
    const blueRolls = Array.from(
      { length: blueDiceCount },
      () => Math.floor(Math.random() * 6) + 1
    );
    setRollResults({ red: redRolls, blue: blueRolls });
    setRollingTrigger((prev) => prev + 1);
    setTroopAnimation(false);
    setShowGif(false);
    setGifKey(Date.now());
    setShowResult(false);
    setTimeout(() => {
      setShowGif(false);
      setTroopAnimation(false);
    }, 5000);
    setTimeout(() => {
      setTroopAnimation(true);

      setTimeout(() => {
        setShowGif(true);

        setTimeout(() => {
          const sortedRed = [...redRolls].sort((a, b) => b - a);
          const sortedBlue = [...blueRolls].sort((a, b) => b - a);

          const comparisons = Math.min(sortedRed.length, sortedBlue.length);
          let attackerLosses = 0;
          let defenderLosses = 0;

          for (let i = 0; i < comparisons; i++) {
            if (sortedRed[i] > sortedBlue[i]) {
              defenderLosses++;
            } else {
              attackerLosses++;
            }
          }

          const winner =
            defenderLosses > attackerLosses
              ? "¡El atacante gana la batalla!"
              : defenderLosses < attackerLosses
              ? "¡El defensor resiste con éxito!"
              : "¡Empate!";
          // Mostrar resultado
          setShowResult(winner);

          //  envío al servidor
          console.log("Resultado para enviar al servidor:", {
            attackerDice: sortedRed,
            defenderDice: sortedBlue,
            attackerLosses,
            defenderLosses,
          });
          setTimeout(() => {
            setShowResult("");
          }, 4000);
        }, 2500);
      }, 600);
    }, 1200);
  };

  const attackerImageIndex = getImageIndex(attackerTroops, true);
  const defenderImageIndex = getImageIndex(defenderTroops, false);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Sliders */}
      <div className="flex gap-10">
        <div className="flex flex-col items-center">
          <label className="font-bold">
            Tropas atacantes: {attackerTroops}
          </label>
          <input
            type="range"
            min={2}
            max={20}
            value={attackerTroops}
            onChange={(e) => setAttackerTroops(Number(e.target.value))}
            className="w-48"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="font-bold">
            Tropas defensoras: {defenderTroops}
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={defenderTroops}
            onChange={(e) => setDefenderTroops(Number(e.target.value))}
            className="w-48"
          />
        </div>
      </div>

      {/* Botón de lanzar */}
      <button
        onClick={handleRoll}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
      >
        Lanzar dados
      </button>

      {/* Formación de batalla */}
      <div className="flex items-center justify-center gap-10 mt-10">
        {/* Soldado atacante */}
        <img
          src={`/soldiers/ataquer/ataquer${attackerImageIndex}.png`}
          alt="Atacante"
          className={`w-80 h-80 mt-10 transition-transform duration-700 ${
            troopAnimation ? "scale-125 -translate-x-12" : ""
          }`}
        />

        {/* Dados rojos en columna */}
        <div className="flex flex-col items-center gap-4">
          {Array.from({ length: redDiceCount }).map((_, i) => (
            <DiceRoller
              key={`red-${i}`}
              color="#E74C3C"
              initialValue={rollResults.red[i]}
              rollingTrigger={rollingTrigger}
            />
          ))}
        </div>
        {/* Espadas */}
        {showGif && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <img
              src={`/effects/swords-crossed.gif?${gifKey}`}
              alt="Clash animation"
              className="w-100 h-100 pointer-events-none transition-opacity duration-500"
            />
          </div>
        )}
        {/* mensaje */}
        {showResult && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-70 text-white px-10 py-10 rounded-xl text-3xl font-bold shadow-lg border border-white">
            {showResult}
          </div>
        )}

        {/* Dados azules en columna */}
        <div className="flex flex-col items-center gap-4">
          {Array.from({ length: blueDiceCount }).map((_, i) => (
            <DiceRoller
              key={`blue-${i}`}
              color="#3498DB"
              initialValue={rollResults.blue[i]}
              rollingTrigger={rollingTrigger}
            />
          ))}
        </div>

        {/* Soldado defensor */}
        <img
          src={`/soldiers/defender/defender${defenderImageIndex}.png`}
          alt="Defensor"
          className={`w-80 h-80 mt-10 transition-transform duration-700 ${
            troopAnimation ? "scale-125 translate-x-12" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default BattleDiceRoller;
