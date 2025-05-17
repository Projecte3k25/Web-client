import { useEffect, useRef, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

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
}) {
  const containerRef = useRef(null);
  const selectedIdsRef = useRef(new Set());
  const socket = useWebSocket();
  const [svgContent, setSvgContent] = useState(null);
  const [myPosition, setMyPosition] = useState(null);

  const groupedCountries = new Set(["INDONESIA", "GREAT_BRITAIN"]);
  useEffect(() => {
    if (!svgContent) return;
    updateStyles();
  }, [svgContent]);

  useEffect(() => {
    if (
      !ultimaAccion ||
      !containerRef.current ||
      !containerRef.current.querySelector("svg")
    )
      return;

    const { territorio } = ultimaAccion;

    const tryAnimate = () => {
      const svg = containerRef.current.querySelector("svg");
      if (!svg) return;

      const territoryEl =
        svg.querySelector(`path[id="${territorio}"]`) ||
        svg.querySelector(`g[id="${territorio}"] path`);
      if (!territoryEl) return;

      territoryEl.style.transition = "transform 0.3s ease";
      territoryEl.style.transform = "translateY(-1.5px)";
      setTimeout(() => {
        territoryEl.style.transform = "translateY(0px)";
      }, 300);
    };

    // Esperar un frame para asegurar que el SVG esté renderizado
    requestAnimationFrame(() => tryAnimate());
  }, [ultimaAccion, svgContent]);

  useEffect(() => {
    if (!svgContent || !territorios) return;

    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    Object.entries(territorios).forEach(([id, data]) => {
      const color = posicioColors[data.posicio];
      const path =
        svg.querySelector(`path[id="${id}"]`) ||
        svg.querySelector(`g[id="${id}"] path`);
      const circle = svg.querySelector(`#${id}_C`);
      const text = svg.querySelector(`#${id}_T`);

      if (path) path.setAttribute("fill", color);
      if (circle) {
        circle.style.display = "inline";
        circle.setAttribute("fill", "black");
      }
      if (text) {
        text.style.display = "inline";
        text.textContent = data.tropas.toString();
      }
    });
  }, [territorios, svgContent]);

  useEffect(() => {
    const profileId = parseInt(localStorage.getItem("profile"), 10);
    if (!profileId || !jugadors) return;

    const jugador = jugadors.find((j) => j.jugador.id === profileId);
    if (jugador) {
      setMyPosition(jugador.posicio);
    }
  }, [jugadors]);

  useEffect(() => {
    fetch(`http://${backendHost}/assets/maps/world.svg`, { mode: "cors" }) /**/
      .then((res) => res.text())
      .then((data) => setSvgContent(data))
      .catch((err) => console.error("Error loading SVG:", err));
  }, []);

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

    paths.forEach((path) => {
      path.addEventListener("click", handleClick);
    });

    updateStyles();

    return () => {
      paths.forEach((path) => {
        path.removeEventListener("click", handleClick);
      });
    };
  });
  // useEffect(() => {
  //   if (!svgContent || !containerRef.current || myPosition === null) return;

  //   const svgElement = containerRef.current.querySelector("svg");
  //   if (!svgElement) return;

  //   // código para ocultar circles, texts...

  //   console.log("Calling updateStyles with myPosition:", myPosition);
  //   updateStyles();
  // }, [svgContent, myPosition]);

  const updateStyles = () => {
    // console.log("entro");
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
        text.textContent = data.tropas.toString();
      }
    });
  }, [territorios, svgContent]);

  return (
    <div className="absolute inset-0 flex items-start justify-center z-0">
      <div
        ref={containerRef}
        className="w-full h-full flex items-start justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
