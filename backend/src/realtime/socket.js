// Modulo Socket.IO isolato
const { Server } = require("socket.io");
let io = null;

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  io.on("connection", (socket) => {
    console.log(`Client connesso: ${socket.id}`);
    socket.on("disconnect", () => console.log(`Client disconnesso: ${socket.id}`));
    // Registrazione stanza utente per force-logout mirato
    socket.on("register_user", (userId) => {
      if (userId != null) socket.join(`user:${userId}`);
    });
  });
  return io;
}
function emit(event, data) { if (io) io.emit(event, data); }
function forceLogoutUser(userId, reason = "account_changed") {
  if (!io) return;
  io.to(`user:${userId}`).emit("forceLogout", { reason });
  setTimeout(() => io.in(`user:${userId}`).disconnectSockets(true), 2000);
}
function clientsCount() { return io ? io.engine.clientsCount : 0; }
module.exports = { init, emit, forceLogoutUser, clientsCount };
