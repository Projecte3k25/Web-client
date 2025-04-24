import Echo from "laravel-echo";
import { io } from "socket.io-client";

window.io = io;

const echo = new Echo({
  broadcaster: "socket.io",
  host: "ws://localhost:8080/chat",
});

export default echo;
