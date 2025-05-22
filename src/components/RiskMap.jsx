import { useEffect, useRef, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import BattleDiceRoller from "./BattleDiceRoller";
import GameChat from "./GameChat";
import SVGMap from "./SVGMap";
import TropasModal from "./TropasModal"; // Importamos el modal
import { toast } from "react-hot-toast";

const posicioColors = {
  1: "#00913f", // verde
  2: "#2196F3", // azul
  3: "#FFEB3B", // amarillo
  4: "#9C27B0", // morado
  5: "#FF9800", // naranja
  6: "#c81d11", //rojo
};
const backendHost = import.meta.env.VITE_BACKEND_HOST_API;

export default function RiskMap({
  jugadors,
  fase,
  jugadorActual,
  territorios,
  ultimaAccion,
  fronteras,
  setTerritorios,
  tropasDisponibles,
}) {
  let selectedTerritorio = null;

  const [batallaActiva, setBatallaActiva] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("reforc"); // "reforc" o "recolocacio"
  const [selectedTerritorioFrom, setSelectedTerritorioFrom] = useState(null);
  const [selectedTerritorioTo, setSelectedTerritorioTo] = useState(null);
  const [fromTropas, setFromTropas] = useState(0);

  const containerRef = useRef(null);
  const selectedIdsRef = useRef(new Set());
  const socket = useWebSocket();
  const [svgContent, setSvgContent] = useState(null);
  const [myPosition, setMyPosition] = useState(null);

  const groupedCountries = new Set(["INDONESIA", "GREAT_BRITAIN"]);

  useEffect(() => {
    const profileId = parseInt(localStorage.getItem("profile"), 10);
    if (!profileId || !jugadors) return;

    const jugador = jugadors.find((j) => j.jugador.id === profileId);
    if (jugador) {
      setMyPosition(jugador.posicio);
    }
  }, [jugadors]);

  useEffect(() => {
    fetch(`http://${backendHost}/assets/maps/world.svg`, { mode: "cors" })
      .then((res) => res.text())
      .then((data) => setSvgContent(data))
      .catch((err) => console.error("Error loading SVG:", err));
  }, []);
  // console.log(svgContent);
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    const paths = svgElement.querySelectorAll("path");

    // Ocultar todos los circle y text por defecto
    const circles = svgElement.querySelectorAll("circle");
    const texts = svgElement.querySelectorAll("text");

    circles.forEach(
      (circle) => {
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", "black");
        circle.style.display = "none";

        circle.style.pointerEvents = "none"; // No bloquear clics
      },
      [svgContent]
    );

    texts.forEach((text) => {
      text.style.display = "none";
      text.style.pointerEvents = "none"; // No bloquear clics
    });
    function updateTropasText(id, tropas) {
      const svg = containerRef.current.querySelector("svg");
      const text = svg?.querySelector(`#${id}_T`);
      if (text) {
        text.textContent = tropas.toString();
        text.style.display = "inline";
      }
    }

    const handleClick = (e) => {
      const path = e.target;
      if (fase === "finalFase") return;

      if (path.tagName.toLowerCase() !== "path") return;

      const group = path.closest("g[id]");
      const groupId = group?.id;
      const idToUse =
        groupId && groupedCountries.has(groupId) ? groupId : path.id;
      if (!idToUse) return;

      switch (fase) {
        case "Colocacio":
          handleClickColocacio(idToUse, path, group);
          break;
        case "Reforç":
          handleClickReforc(idToUse);
          break;
        case "ReforçTropes":
          handleClickReforcTropes(idToUse);
          break;
        case "Atac":
          handleClickAtac(idToUse);
          break;
        case "Recolocacio":
          handleClickRecolocacio(idToUse);
          break;
        default:
          console.log(`No se ha definido acción para la fase: ${fase}`);
      }
    };

    const handleClickColocacio = (territorioId, path, group) => {
      const profileId = parseInt(localStorage.getItem("profile"), 10);
      if (!jugadorActual || jugadorActual.id !== profileId) return;

      const currentColor = path.getAttribute("fill");
      const colorYaUsado = Object.values(posicioColors).includes(currentColor);
      if (colorYaUsado) return;

      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;

      // Pintar el territorio
      if (group && groupedCountries.has(group.id)) {
        group
          .querySelectorAll("path")
          .forEach((p) => p.setAttribute("fill", posicioColors[myPosition]));
      } else {
        path.setAttribute("fill", posicioColors[myPosition]);
      }

      // Mostrar círculo y texto con valor 1
      const circle = svg.querySelector(`#${territorioId}_C`);
      const text = svg.querySelector(`#${territorioId}_T`);

      if (circle) {
        circle.style.display = "inline";
        circle.setAttribute("fill", "black");
      }

      if (text) {
        text.style.display = "inline";
        text.textContent = "1";
      }

      // Enviar al servidor
      const msg = JSON.stringify({
        method: "accio",
        data: {
          territori: territorioId,
        },
      });

      socket.send(msg);
    };

    const handleClickReforc = (territorioId) => {
      const profileId = parseInt(localStorage.getItem("profile"), 10);
      if (!jugadorActual || jugadorActual.id !== profileId) return;

      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;

      const pathEl =
        svg.querySelector(`path[id="${territorioId}"]`) ||
        svg.querySelector(`g[id="${territorioId}"] path`);
      if (!pathEl) return;

      const currentColor = pathEl.getAttribute("fill");
      const playerColor = posicioColors[myPosition];

      // Verificar que sea territorio propio
      if (currentColor !== playerColor) return;

      // Obtener elementos del SVG
      const textEl = svg.querySelector(`#${territorioId}_T`);
      const circleEl = svg.querySelector(`#${territorioId}_C`);

      // Leer valor actual y aumentar en 1
      let currentValue = parseInt(textEl?.textContent || "0", 10);
      currentValue = isNaN(currentValue) ? 1 : currentValue + 1;

      // Actualizar texto
      if (textEl) {
        textEl.textContent = currentValue.toString();
        textEl.style.display = "inline";
      }

      // Mostrar círculo
      if (circleEl) {
        circleEl.style.display = "inline";
        circleEl.setAttribute("fill", "black");
      }

      // Enviar acción al servidor
      const msg = JSON.stringify({
        method: "accio",
        data: {
          territori: territorioId,
        },
      });

      socket.send(msg);
    };

    const handleClickReforcTropes = (territorioId) => {
      const profileId = parseInt(localStorage.getItem("profile"), 10);
      if (!jugadorActual || jugadorActual.id !== profileId) return;

      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;

      const pathEl =
        svg.querySelector(`path[id="${territorioId}"]`) ||
        svg.querySelector(`g[id="${territorioId}"] path`);
      if (!pathEl) return;

      const currentColor = pathEl.getAttribute("fill");
      const playerColor = posicioColors[myPosition];

      // Verificar que sea territorio propio
      if (currentColor !== playerColor) return;

      // Validar disponibilidad de tropas antes de abrir el modal
      if (tropasDisponibles <= 0) {
        toast.error("Ya no tienes tropas disponibles.");
        return;
      }

      // Preparar datos para el modal
      setModalMode("reforc");
      setSelectedTerritorioFrom(territorioId);
      setModalOpen(true);
    };

    const handleClickAtac = (territorioId) => {
      const svg = containerRef.current?.querySelector("svg");
      if (
        !svg ||
        !fronteras ||
        !territorios ||
        myPosition === null ||
        !jugadorActual
      )
        return;

      const profileId = parseInt(localStorage.getItem("profile"), 10);
      if (jugadorActual.id !== profileId) return;

      const territorioData = territorios[territorioId];
      if (!territorioData) return;

      // Si ya hay un territorio seleccionado, y ahora hacen clic en un enemigo vecino
      if (
        selectedTerritorio &&
        fronteras[selectedTerritorio]?.includes(territorioId) &&
        territorioData.posicio !== myPosition
      ) {
        const fromTextEl = svg.querySelector(`#${selectedTerritorio}_T`);
        const toTextEl = svg.querySelector(`#${territorioId}_T`);

        const fromTropas = parseInt(fromTextEl?.textContent || "0", 10);
        const toTropas = parseInt(toTextEl?.textContent || "0", 10);
        if (fromTropas <= 1) {
          toast.error("Necesitas al menos 2 tropas para atacar.");

          setSelectedTerritorioFrom(null);
          selectedTerritorio = null;
          return;
        }
        // Aquí lanzamos el BattleDiceRoller
        setBatallaActiva({
          atacanteId: selectedTerritorio,
          defensorId: territorioId,
          tropasA: fromTropas,
          tropasD: toTropas,
        });

        selectedTerritorio = null;
        return;
      }

      // Si no hay nada seleccionado, y clicas uno tuyo válido
      if (territorioData.posicio === myPosition) {
        selectedTerritorio = territorioId;

        const allCircles = svg.querySelectorAll("circle");
        allCircles.forEach((c) => c.classList.remove("pulsating"));

        const vecinos = fronteras[territorioId];
        if (!Array.isArray(vecinos)) return;

        vecinos.forEach((vecinoId) => {
          const vecinoData = territorios[vecinoId];
          if (vecinoData && vecinoData.posicio !== myPosition) {
            const circle = svg.querySelector(`#${vecinoId}_C`);
            if (circle) {
              circle.style.display = "inline";
              circle.classList.add("pulsating");
            }
          }
        });
      }
    };

    const handleClickRecolocacio = (territorioId) => {
      const svg = containerRef.current?.querySelector("svg");
      if (
        !svg ||
        !fronteras ||
        !territorios ||
        myPosition === null ||
        !jugadorActual
      )
        return;

      const profileId = parseInt(localStorage.getItem("profile"), 10);
      if (jugadorActual.id !== profileId) return;

      const territorioData = territorios[territorioId];
      if (!territorioData) return;

      // Si ya hay un territorio seleccionado, y ahora clicas en otro tuyo y hacen frontera
      if (
        selectedTerritorio &&
        fronteras[selectedTerritorio]?.includes(territorioId) &&
        territorioData.posicio === myPosition
      ) {
        const fromTextEl = svg.querySelector(`#${selectedTerritorio}_T`);
        const fromTropas = parseInt(fromTextEl?.textContent || "0", 10);

        if (fromTropas <= 1) {
          toast.error("No puedes mover tropas, necesitas al menos 2.");
          selectedTerritorio = null;
          return;
        }

        // Preparamos los datos para el modal
        setModalMode("recolocacio");
        setSelectedTerritorioFrom(selectedTerritorio);
        setSelectedTerritorioTo(territorioId);
        setFromTropas(fromTropas);
        setModalOpen(true);

        return;
      }

      // Primer clic en territorio válido propio
      if (territorioData.posicio === myPosition) {
        selectedTerritorio = territorioId;

        const allCircles = svg.querySelectorAll("circle");
        allCircles.forEach((c) => {
          c.classList.remove("pulsating");
          c.classList.remove("pulsating-black");
        });

        const vecinos = fronteras[territorioId];
        if (!Array.isArray(vecinos)) return;

        vecinos.forEach((vecinoId) => {
          const vecinoData = territorios[vecinoId];
          if (vecinoData && vecinoData.posicio === myPosition) {
            const circle = svg.querySelector(`#${vecinoId}_C`);
            if (circle) {
              circle.style.display = "inline";
              circle.classList.add("pulsating-black");
            }
          }
        });
      }
    };

    const handleConfirmRecolocacio = (tropas) => {
      // Solo se ejecuta cuando el usuario confirma en el modal de recolocación
      const from = selectedTerritorioFrom;
      const to = selectedTerritorioTo;

      // Enviar al servidor
      const msg = JSON.stringify({
        method: "accio",
        data: {
          from: from,
          to: to,
          tropas: tropas,
        },
      });

      socket.send(msg);

      // Actualizar visualmente (opcional si el servidor maneja esto completamente)
      const svg = containerRef.current?.querySelector("svg");
      if (svg) {
        const fromText = svg.querySelector(`#${from}_T`);
        const toText = svg.querySelector(`#${to}_T`);

        const currentFrom = parseInt(fromText?.textContent || "0", 10);
        const currentTo = parseInt(toText?.textContent || "0", 10);

        // Calcular nuevas tropas
        const newFrom = currentFrom - tropas;
        const newTo = currentTo + tropas;

        // Actualizar texto en el SVG
        if (fromText) fromText.textContent = newFrom.toString();
        if (toText) toText.textContent = newTo.toString();
      }

      selectedTerritorio = null;
    };

    paths.forEach((path) => {
      path.addEventListener("click", handleClick);
    });

    updateStyles();

    return () => {
      paths.forEach((path) => {
        path.removeEventListener("click", handleClick);
      });
    };
  }, [
    svgContent,
    territorios,
    fronteras,
    jugadorActual,
    myPosition,
    fase,
    batallaActiva,
    tropasDisponibles,
    selectedTerritorioFrom,
    selectedTerritorioTo,
    fromTropas,
  ]);

  // Manejadores de confirmación para las acciones que involucran el modal
  const handleConfirmReforcTropes = (tropas) => {
    // Solo se ejecuta cuando el usuario confirma en el modal
    const territorioId = selectedTerritorioFrom;

    // Enviar acción al servidor
    const msg = JSON.stringify({
      method: "accio",
      data: {
        territori: territorioId,
        tropas: tropas,
      },
    });

    socket.send(msg);

    // Actualizar visualmente (opcional, si el servidor no maneja esto completamente)
    const svg = containerRef.current?.querySelector("svg");
    if (svg) {
      const textEl = svg.querySelector(`#${territorioId}_T`);
      const circleEl = svg.querySelector(`#${territorioId}_C`);

      if (textEl) {
        let currentValue = parseInt(textEl?.textContent || "0", 10);
        currentValue = isNaN(currentValue) ? tropas : currentValue + tropas;
        textEl.textContent = currentValue.toString();
        textEl.style.display = "inline";
      }

      if (circleEl) {
        circleEl.style.display = "inline";
        circleEl.setAttribute("fill", "black");
      }
    }
  };

  const handleConfirmRecolocacio = (tropas) => {
    // Solo se ejecuta cuando el usuario confirma en el modal de recolocación
    const from = selectedTerritorioFrom;
    const to = selectedTerritorioTo;

    // Enviar al servidor
    const msg = JSON.stringify({
      method: "accio",
      data: {
        from: from,
        to: to,
        tropas: tropas,
      },
    });

    socket.send(msg);

    // Actualizar visualmente (opcional si el servidor maneja esto completamente)
    const svg = containerRef.current?.querySelector("svg");
    if (svg) {
      const fromText = svg.querySelector(`#${from}_T`);
      const toText = svg.querySelector(`#${to}_T`);

      const currentFrom = parseInt(fromText?.textContent || "0", 10);
      const currentTo = parseInt(toText?.textContent || "0", 10);

      // Calcular nuevas tropas
      const newFrom = currentFrom - tropas;
      const newTo = currentTo + tropas;

      // Actualizar texto en el SVG
      if (fromText) fromText.textContent = newFrom.toString();
      if (toText) toText.textContent = newTo.toString();
    }
  };

  const updateStyles = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const allPaths = svgElement.querySelectorAll("path");
    allPaths.forEach((path) => {
      const group = path.closest("g[id]");
      const groupId = group?.id;
      const isGrouped = groupId && groupedCountries.has(groupId);
      const idToUse = isGrouped ? groupId : path.id;

      const isSelected = selectedIdsRef.current.has(idToUse);

      // Color del path
      const currentColor = path.getAttribute("fill");
      const isPlayerColor = Object.values(posicioColors).includes(currentColor);
      if (isGrouped) {
        const groupPaths = group.querySelectorAll("path");
        groupPaths.forEach((p) =>
          p.setAttribute(
            "fill",
            isSelected ? posicioColors[myPosition] : "#ffffff"
          )
        );
      } else {
        path.setAttribute(
          "fill",
          isSelected ? posicioColors[myPosition] : "#ffffff"
        );
      }

      path.setAttribute("stroke", "#333339");
      path.setAttribute("stroke-width", "0.5");

      // Mostrar u ocultar circle/text
      const circle = svgElement.querySelector(`#${idToUse}_C`);
      const text = svgElement.querySelector(`#${idToUse}_T`);

      if (circle) circle.style.display = isSelected ? "inline" : "none";
      if (text) {
        text.style.display = isSelected ? "inline" : "none";

        // AQUI PUEDO CAMBIAR EL NUMERO DE TROPAS
        const troopValue = 1;
        if (troopValue !== undefined) {
          text.textContent = troopValue.toString();
        }
      }
    });
  };

  useEffect(() => {
    if (!jugadors || myPosition === null) return;

    const message = JSON.stringify({
      method: "loaded",
      data: {},
    });

    const timeout = setTimeout(() => {
      socket.send(message);
    }, 3000);

    return () => clearTimeout(timeout); // limpieza
  }, [jugadors, myPosition]);

  useEffect(() => {
    if (!ultimaAccion) return;

    if (ultimaAccion.tipo === "ReforçTropes") {
      const { territorio, tropas } = ultimaAccion;

      setTerritorios((prev) => {
        if (!prev[territorio]) return prev;

        const actualizado = { ...prev };
        actualizado[territorio] = {
          ...actualizado[territorio],
          tropas: actualizado[territorio].tropas + tropas,
        };

        return actualizado;
      });
    }

    if (ultimaAccion.tipo === "Recolocacio") {
      const { from, to, tropas } = ultimaAccion;

      setTerritorios((prev) => {
        if (!prev[from] || !prev[to]) return prev;

        const actualizado = { ...prev };

        actualizado[from] = {
          ...actualizado[from],
          tropas: actualizado[from].tropas - tropas,
        };

        actualizado[to] = {
          ...actualizado[to],
          tropas: actualizado[to].tropas + tropas,
        };

        return actualizado;
      });
    }

    if (ultimaAccion.tipo === "Atac") {
      const { from, to, conquista, tropasAtacTotal, tropasDefTotal } =
        ultimaAccion;

      setTerritorios((prev) => {
        if (!prev[from] || !prev[to]) return prev;

        const actualizado = { ...prev };

        // Obtener la posicio del jugador que tenía el territorio 'from' (el atacante)
        const atacantePosicio = prev[from].posicio;

        if (conquista) {
          actualizado[to] = {
            ...actualizado[to],
            posicio: atacantePosicio, // el atacante conquista el territorio
            tropas: tropasDefTotal ?? 0,
          };
        } else {
          actualizado[to] = {
            ...actualizado[to],
            tropas: tropasDefTotal ?? 0,
          };
        }

        actualizado[from] = {
          ...actualizado[from],
          tropas: tropasAtacTotal ?? 0,
        };

        return actualizado;
      });
    }
  }, [ultimaAccion]);

  useEffect(() => {
    // console.log("REPINTADO");
    if (!svgContent || !territorios) return;

    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    Object.entries(territorios).forEach(([id, data]) => {
      const color = posicioColors[data.posicio];

      const group = svg.querySelector(`g[id="${id}"]`);
      if (group) {
        // Si es un grupo, pintar todos sus paths
        const paths = group.querySelectorAll("path");
        paths.forEach((p) => p.setAttribute("fill", color));
      } else {
        // Si no es grupo, buscar el path directamente
        const path = svg.querySelector(`path[id="${id}"]`);
        if (path) path.setAttribute("fill", color);
      }

      const circle = svg.querySelector(`#${id}_C`);
      const text = svg.querySelector(`#${id}_T`);

      if (circle) {
        circle.style.display = "inline";
        circle.setAttribute("fill", "black");
      }

      if (text) {
        text.style.display = "inline";
        text.textContent = (data.tropas ?? 0).toString();
      }
    });
  }, [
    svgContent,
    territorios,
    fronteras,
    jugadorActual,
    myPosition,
    fase,
    batallaActiva,
    tropasDisponibles,
    selectedTerritorioFrom,
    selectedTerritorioTo,
    fromTropas,
    modalOpen,
  ]);

  // Manejador para el evento de confirmación del modal
  const handleModalConfirm = (tropas) => {
    if (modalMode === "reforc") {
      handleConfirmReforcTropes(tropas);
    } else if (modalMode === "recolocacio") {
      handleConfirmRecolocacio(tropas);
    }
  };

  return (
    <div className="w-full flex justify-center items-start relative z-0 p-2">
      <div
        ref={containerRef}
        className="w-full max-w-[1200px] aspect-[16/9]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Modal para ReforçTropes y Recolocacio */}
      <TropasModal
        isOpen={modalOpen}
        mode={modalMode}
        territorioFrom={selectedTerritorioFrom}
        territorioTo={selectedTerritorioTo}
        tropasDisponibles={tropasDisponibles}
        fromTropas={fromTropas}
        onClose={() => {
          setModalOpen(false);
          selectedTerritorio = null;
        }}
        onConfirm={handleModalConfirm}
      />
      {batallaActiva && (
        <BattleDiceRoller
          atacanteId={batallaActiva.atacanteId}
          defensorId={batallaActiva.defensorId}
          attackerTroops={batallaActiva.tropasA}
          defenderTroops={batallaActiva.tropasD}
          ultimaAccion={ultimaAccion?.tipo === "Atac" ? ultimaAccion : null}
          onClose={() => setBatallaActiva(null)}
        />
      )}
    </div>
  );
}
