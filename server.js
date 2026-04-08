// server.js
const WebSocket = require("ws");

// Serveur WebSocket simple, écoute le port par défaut (Render gère l'URL publique)
const wss = new WebSocket.Server({ port: 8080 });

console.log("✅ Serveur WebSocket lancé");

// Stockage des clients connectés
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("🔌 Nouveau client connecté");

  ws.on("message", (message) => {
    const msg = message.toString();
    console.log("📩 Message reçu :", msg);

    // Envoyer le message à tous les autres clients
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
