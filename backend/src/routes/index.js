// Aggregatore delle route API
const express = require("express");
const router = express.Router();
router.use("/auth", require("./authRoutes"));
router.use("/clienti", require("./clientiRoutes"));
router.use("/ordini", require("./ordiniRoutes"));
router.use("/utenti", require("./utentiRoutes"));
router.use("/marche", require("./marcheRoutes"));
router.use("/modelli", require("./modelliRoutes"));
router.use("/admin", require("./downloadRoutes"));
module.exports = router;
