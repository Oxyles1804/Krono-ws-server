// server.js
const WebSocket = require("ws");

// Render fournit le port via l'environnement
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`✅ Serveur WebSocket lancé sur le port ${PORT}`);

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("🔌 Nouveau client connecté");

  ws.on("message", (message) => {
    const msg = message.toString();
    console.log("📩 Message reçu :", msg);

    // Broadcast à tous les autres clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("❌ Client déconnecté");
  });
});
