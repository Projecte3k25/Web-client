const messageHandlers = {
  getJugadors: (data, setPlayers) => {
    if (Array.isArray(data.data)) {
      setPlayers(data.data);
    }
  },

  joinPlayer: (data, setPlayers) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === data.player.id);
      return exists ? prev : [...prev, data.player];
    });
  },
  getPartidas: (data, setGames) => {
    console.log(data);
    if (Array.isArray(data.data)) {
      setGames(data.data);
    }
  },
  newChatLobbyMessage: (data, setMessages) => {
    if (Array.isArray(data.data)) {
      setMessages((prev) => [...prev, ...data.data]);
    }
  },
  login: (data) => {
    console.log(data.data);
  },
  error: (data) => {
    console.log(data.data);
  },
};

export default messageHandlers;
