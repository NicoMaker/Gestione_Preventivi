// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../db/init");

// POST - Login
router.post("/login", async (req, res) => {
  const { nome, password } = req.body;

  if (!nome || !password) {
    return res.status(400).json({ error: "Nome e password obbligatori" });
  }

  db.get(
    "SELECT * FROM utenti WHERE nome = ?",
    [nome],
    async (err, user) => {
      if (err) {
        console.error("Errore database login:", err);
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: "Credenziali non valide" });
      }

      try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ error: "Credenziali non valide" });
        }

        console.log(`Login riuscito per utente: ${user.nome}`);
        res.json({
          success: true,
          message: "Login effettuato con successo",
          nome: user.nome,
          id: user.id
        });
      } catch (error) {
        console.error("Errore bcrypt:", error);
        res
          .status(500)
          .json({ error: "Errore durante la verifica della password" });
      }
    }
  );
});

module.exports = router;
