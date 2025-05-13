const mockCountries = [
  { id: "arg", name: "Argentina", owner: "Jugador 1", troops: 3 },
  { id: "bra", name: "Brasil", owner: "Jugador 2", troops: 5 },
];

const Partida = () => {
  return (
    <div>
      <h2>Tablero</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        {mockCountries.map((country) => (
          <div
            key={country.id}
            style={{ border: "1px solid black", padding: "1rem" }}
          >
            <h4>{country.name}</h4>
            <p>Dueño: {country.owner}</p>
            <p>Tropas: {country.troops}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partida;
