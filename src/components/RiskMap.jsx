import { useEffect, useRef, useState } from "react";

export default function RiskMap() {
  const containerRef = useRef(null);
  const selectedIdsRef = useRef(new Set());
  const [svgContent, setSvgContent] = useState(null);

  const groupedCountries = new Set(["INDONESIA", "UK"]);

  // Cargar el SVG
  useEffect(() => {
    fetch("/maps/prueba.svg")
      .then((res) => res.text())
      .then((data) => setSvgContent(data))
      .catch((err) => console.error("Error loading SVG:", err));
  }, []);

  // Aplicar listeners una vez que se cargue el SVG
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    const paths = svgElement.querySelectorAll("path");

    const handleClick = (e) => {
      const path = e.target;
      if (path.tagName.toLowerCase() !== "path") return;

      const group = path.closest("g[id]");
      const groupId = group?.id;

      if (groupId && groupedCountries.has(groupId)) {
        const isSelected = selectedIdsRef.current.has(groupId);

        if (isSelected) {
          selectedIdsRef.current.delete(groupId);
        } else {
          selectedIdsRef.current.add(groupId);
        }
      } else if (path.id) {
        const isSelected = selectedIdsRef.current.has(path.id);

        if (isSelected) {
          selectedIdsRef.current.delete(path.id);
        } else {
          selectedIdsRef.current.add(path.id);
        }
      }

      // ✅ Mostrar en consola los IDs seleccionados
      console.log("Selected IDs:", Array.from(selectedIdsRef.current));

      updateStyles();
    };

    // Añadir listeners
    paths.forEach((path) => {
      path.addEventListener("click", handleClick);
    });

    updateStyles();

    return () => {
      paths.forEach((path) => {
        path.removeEventListener("click", handleClick);
      });
    };
  }, [svgContent]);

  const updateStyles = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;

    // Primero, manejar países agrupados (INDONESIA, UK)
    groupedCountries.forEach((groupId) => {
      const group = svgElement.querySelector(`g[id='${groupId}']`);
      if (!group) return;

      const isSelected = selectedIdsRef.current.has(groupId);
      const paths = group.querySelectorAll("path");

      paths.forEach((path) => {
        if (isSelected) {
          path.setAttribute("fill", "#ff6666");
        } else {
          path.setAttribute("fill", "#ffffff");
          path.setAttribute("stroke", "#333339");
          path.setAttribute("stroke-width", "0.5");
        }
      });
    });

    // Ahora, manejar paths individuales (los que no están en grupos seleccionados)
    const allPaths = svgElement.querySelectorAll("path");
    allPaths.forEach((path) => {
      const parentGroup = path.closest("g[id]");
      const isGrouped = parentGroup && groupedCountries.has(parentGroup.id);

      // Saltar los paths que ya están cubiertos por países agrupados
      if (isGrouped) return;

      const isSelected = selectedIdsRef.current.has(path.id);
      if (isSelected) {
        path.setAttribute("fill", "#ff6666");
      } else {
        path.setAttribute("fill", "#ffffff");
        path.setAttribute("stroke", "#333339");
        path.setAttribute("stroke-width", "0.5");
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
