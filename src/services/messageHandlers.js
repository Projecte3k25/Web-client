const messageHandlers = {
  lobby: (data, setPlayers, setGame) => {
    const { jugadors, partida } = data.data || {};
    // console.log(data);
    if (Array.isArray(jugadors)) {
      setPlayers(jugadors);
    }
    if (partida) {
      setGame(partida);
    }
  },
  profile: (data, setProfile) => {
    console.log(data);
    setProfile(data.data);
  },

  joinPlayer: (data, setPlayers) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === data.player.id);
      return exists ? prev : [...prev, data.player];
    });
  },
  getPartidas: (data, setGames) => {
    if (Array.isArray(data.data)) {
      setGames(data.data);
    }
  },
  chat: (data, setMessages) => {
    setMessages((prevMessages) => [...prevMessages, data.data]);
  },
  login: (data) => {
    console.log(data.data);
  },
  error: (data) => {
    console.log(data.data);
  },
};

export default messageHandlers;
