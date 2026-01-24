// server.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ Serveur WebSocket lancé sur ws://0.0.0.0:8080");

// ================== ROOMS ==================
const rooms = {};

wss.on("connection", (ws) => {
  console.log("🔌 Nouveau client connecté");

  ws.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch {
      console.log("❌ Message invalide :", message.toString());
      return;
    }

    console.log("📩 Message reçu :", data);

    // ====== CRÉATION DE ROOM ======
    if (data.type === "CREATE_ROOM") {
      const { roomId, password } = data;

      if (!roomId || !password) {
        ws.send(JSON.stringify({ error: "Paramètres manquants" }));
        return;
      }

      if (rooms[roomId]) {
        ws.send(JSON.stringify({ error: "Room déjà existante" }));
        return;
      }

      rooms[roomId] = {
        password,
        clients: [ws]
      };

      ws.roomId = roomId;

      ws.send(JSON.stringify({ success: "Room créée" }));
      console.log("✅ Room créée :", roomId);
      return;
    }

    // ====== REJOINDRE ROOM ======
    if (data.type === "JOIN_ROOM") {
      const { roomId, password } = data;
      const room = rooms[roomId];

      if (!room) {
        ws.send(JSON.stringify({ error: "Room inexistante" }));
        return;
      }

      if (room.password !== password) {
        ws.send(JSON.stringify({ error: "Mot de passe incorrect" }));
        return;
      }

      if (room.clients.length >= 2) {
        ws.send(JSON.stringify({ error: "Room pleine" }));
        return;
      }

      room.clients.push(ws);
      ws.roomId = roomId;

      ws.send(JSON.stringify({ success: "Room rejointe" }));
      console.log("👥 Client rejoint :", roomId);
      return;
    }

    // ====== START_SEQUENCE ======
    if (data.type === "START_SEQUENCE") {
      const room = rooms[ws.roomId];
      if (!room) return;

      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "START_SEQUENCE" }));
        }
      });
      console.log("🚦 START_SEQUENCE envoyé dans la room :", ws.roomId);
      return;
    }

    // ====== GO_NOW ======
    if (data.type === "GO_NOW") {
      const room = rooms[ws.roomId];
      if (!room) return;

      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "GO_NOW" }));
        }
      });
      console.log("🏁 GO_NOW envoyé dans la room :", ws.roomId);
      return;
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    if (!roomId || !rooms[roomId]) return;

    rooms[roomId].clients = rooms[roomId].clients.filter(c => c !== ws);

    console.log("❌ Client quitté :", roomId);

    if (rooms[roomId].clients.length === 0) {
      delete rooms[roomId];
      console.log("🗑️ Room supprimée :", roomId);
    }
  });
});
