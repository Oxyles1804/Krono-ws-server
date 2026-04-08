// server.js
const WebSocket = require("ws");

// Serveur WebSocket minimal pour Render
const wss = new WebSocket.Server({ noServer: true }); // Render gère l'URL publique

console.log("✅ Serveur WebSocket prêt");

// Stockage des clients connectés
const clients = new Set();

// Gestion des connexions
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

// Pour Render, il faut utiliser le serveur HTTP intégré
const http = require("http");
const server = http.createServer();
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`🌐 Serveur HTTP + WebSocket lancé sur le port ${process.env.PORT || 3000}`);
});
