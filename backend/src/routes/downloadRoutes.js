const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const dbPath = path.join(__dirname, "..", "..", "db", "Preventivi.db");
router.get("/download-db", (req, res) => {
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "File database non trovato", path: dbPath });
  }
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="Preventivi.db"`);
  const stream = fs.createReadStream(dbPath);
  stream.on("error", (err) => {
    if (!res.headersSent) res.status(500).json({ error: "Errore durante la lettura del database" });
  });
  stream.pipe(res);
});
module.exports = router;
