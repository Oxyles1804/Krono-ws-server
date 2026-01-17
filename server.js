// server.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ Serveur WebSocket lancé sur ws://0.0.0.0:8080");

const clients = new Set();

let rooms = {}; // { roomName: { password: "abcd", clients: [] } }

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message); // { room, password, type, payload }

      if (!data.room) return;

      // Room existe déjà ?
      if (!rooms[data.room]) {
        // Créer la room
        rooms[data.room] = { password: data.password, clients: [] };
      } else {
        // Vérifier le mot de passe
        if (rooms[data.room].password !== data.password) {
          ws.send(JSON.stringify({ type: "ERROR", payload: "Mot de passe incorrect" }));
          return;
        }
      }

      // Ajouter le client si pas déjà présent
      if (!rooms[data.room].clients.includes(ws)) rooms[data.room].clients.push(ws);

      // Propager le message aux autres clients de la room
      rooms[data.room].clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: data.type, payload: data.payload }));
        }
      });

    } catch (e) {
      console.error("Erreur WS :", e);
    }
  });

  ws.on('close', () => {
    Object.keys(rooms).forEach(room => {
      rooms[room].clients = rooms[room].clients.filter(c => c !== ws);
      if (rooms[room].clients.length === 0) delete rooms[room];
    });
  });
});


