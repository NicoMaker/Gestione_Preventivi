// Composizione app Express: middleware, static, API, SPA fallback, errori
const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes");
const realtime = require("./realtime/socket");
const { errorHandler } = require("./middleware/errorHandler");
const { getLocalIP, getPublicIP } = require("./utils/network");

function creaApp({ port } = {}) {
  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  app.use(express.static(frontendDir));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path} da ${req.ip}`);
    }
    next();
  });

  app.use("/api", apiRoutes);

  app.get("/api/health", async (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      socketConnections: realtime.clientsCount(),
      publicIP: await getPublicIP(),
      localIP: getLocalIP(),
      port,
    });
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Endpoint API non trovato" });
    }
    next();
  });

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });

  app.use(errorHandler);
  return app;
}

module.exports = creaApp;
