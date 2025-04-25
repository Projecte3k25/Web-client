// WebSocketService.js
class WebSocketService {
  static instance = null;
  socket = null;
  listeners = [];

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(url) {
    if (this.socket) return;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    this.socket.onmessage = (event) => {
      this.listeners.forEach((cb) => cb(event.data));
    };

    this.socket.onclose = () => {
      console.log("WebSocket cerrado");
      this.socket = null;
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  onMessage(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

export default WebSocketService.getInstance();
