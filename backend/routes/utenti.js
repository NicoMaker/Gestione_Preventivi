const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../db/init");

// Funzione centralizzata per il controllo forza password
// Requisiti: 8+ caratteri, 1 Maiuscola, 1 Minuscola, 1 Numero
function isPasswordStrong(password) {
  if (typeof password !== "string") return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// GET /api/utenti - lista utenti
router.get("/", (req, res) => {
  db.all(
    "SELECT id, nome, created_at FROM utenti ORDER BY nome COLLATE NOCASE, nome",
    [],
    (err, rows) => {
      if (err) {
        console.error("Errore nel recupero utenti:", err);
        return res.status(500).json({ error: "Errore nel recupero utenti" });
      }
      res.json(rows);
    },
  );
});

// POST /api/utenti - CREA NUOVO UTENTE
router.post("/", async (req, res) => {
  const { nome, password } = req.body;

  if (!nome || !password) {
    return res.status(400).json({ error: "Nome e password obbligatori" });
  }

  if (nome.length < 3) {
    return res
      .status(400)
      .json({ error: "Il nome deve contenere almeno 3 caratteri." });
  }

  // CONTROLLO PASSWORD (CREAZIONE)
  if (!isPasswordStrong(password)) {
    return res.status(400).json({
      error:
        "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO utenti (nome, password) VALUES (?, ?)",
      [nome.trim(), hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Nome già esistente" });
          }
          return res
            .status(500)
            .json({ error: "Errore durante la creazione utente" });
        }
        const io = req.app.get("io");
        if (io) {
          io.emit("utente_aggiunto");
          io.emit("utenti_aggiornati");
        }
        res.json({ id: this.lastID, nome: nome.trim() });
      },
    );
  } catch (error) {
    res
      .status(500)
      .json({ error: "Errore di sicurezza nella gestione password" });
  }
});

// PUT /api/utenti/:id - MODIFICA UTENTE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, password } = req.body;

  if (!nome && !password) {
    return res.status(400).json({ error: "Nome o Password obbligatori" });
  }

  db.get("SELECT * FROM utenti WHERE id = ?", [id], async (err1, user) => {
    if (err1 || !user)
      return res.status(404).json({ error: "Utente non trovato" });

    const oldNome = user.nome;
    let newNome = nome ? nome.trim() : user.nome;
    let newPasswordHash = user.password;

    // Controllo nome
    if (nome && nome.length < 3) {
      return res
        .status(400)
        .json({ error: "Il nome deve contenere almeno 3 caratteri." });
    }

    // CONTROLLO PASSWORD (MODIFICA - solo se inserita)
    if (password && password.trim() !== "") {
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          error:
            "La nuova password non rispetta i requisiti (8 car., 1 maiuscola, 1 minuscola, 1 numero).",
        });
      }
      try {
        newPasswordHash = await bcrypt.hash(password, 10);
      } catch (e) {
        return res.status(500).json({ error: "Errore hashing" });
      }
    }

    // Update DB
    db.run(
      "UPDATE utenti SET nome = ?, password = ? WHERE id = ?",
      [newNome, newPasswordHash, id],
      function (err) {
        if (err) return res.status(500).json({ error: "Errore aggiornamento" });

        const io = req.app.get("io");
        if (io) {
          // Emetti evento con vecchio e nuovo nome
          io.emit("utente_modificato", { 
            id, 
            oldNome, 
            newNome 
          });
          io.emit("utenti_aggiornati");
        }
        res.json({ success: true, nome: newNome });
      },
    );
  });
});

// DELETE /api/utenti/:id - elimina utente
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  // Prima ottieni il nome dell'utente
  db.get("SELECT nome FROM utenti WHERE id = ?", [id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    
    const nomeUtente = user.nome;
    
    db.get("SELECT COUNT(*) AS total FROM utenti", [], (err, row) => {
      if (row.total <= 1)
        return res
          .status(400)
          .json({ error: "Impossibile eliminare l'ultimo utente" });

      db.run("DELETE FROM utenti WHERE id = ?", [id], function (err) {
        if (err) {
          return res.status(500).json({ error: "Errore eliminazione utente" });
        }
        
        const io = req.app.get("io");
        if (io) {
          // Emetti evento con nome utente eliminato
          io.emit("utente_eliminato", { 
            id, 
            nomeUtente 
          });
          io.emit("utenti_aggiornati");
        }
        res.json({ success: true });
      });
    });
  });
});

module.exports = router;