// backend/routes/utenti.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../db/init");

// Controllo forza password
function isPasswordStrong(password) {
  if (typeof password !== "string") return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// GET /api/utenti - lista utenti (senza password)
router.get("/", (req, res) => {
  db.all(
    "SELECT id, nome, created_at FROM utenti ORDER BY nome ASC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Errore nel recupero utenti:", err);
        return res.status(500).json({ error: "Errore nel recupero utenti" });
      }
      res.json(rows);
    }
  );
});

// POST /api/utenti - crea nuovo utente
router.post("/", async (req, res) => {
  const { nome, password } = req.body;

  if (!nome || !password) {
    return res.status(400).json({ error: "Nome e password obbligatori" });
  }

  if (nome.length < 3) {
    return res
      .status(400)
      .json({ error: "Nome deve contenere almeno 3 caratteri." });
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
          console.error("Errore inserimento utente:", err);
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
      }
    );
  } catch (error) {
    console.error("Errore hashing password:", error);
    res
      .status(500)
      .json({ error: "Errore di sicurezza nella gestione password" });
  }
});

// PUT /api/utenti/:id - modifica utente
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, password } = req.body;

  if (!nome && !password) {
    return res.status(400).json({
      error: "Almeno Nome o Password sono obbligatori per l'aggiornamento",
    });
  }

  db.get("SELECT * FROM utenti WHERE id = ?", [id], async (err1, user) => {
    if (err1) {
      console.error("Errore recupero utente per modifica:", err1);
      return res
        .status(500)
        .json({ error: "Errore durante il recupero utente" });
    }
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    let newNome = nome ? nome.trim() : user.nome;
    let newPasswordHash = user.password;

    if (nome && nome.length < 3) {
      return res
        .status(400)
        .json({ error: "Nome deve contenere almeno 3 caratteri." });
    }

    if (password) {
      try {
        newPasswordHash = await bcrypt.hash(password, 10);
      } catch (error) {
        console.error("Errore hashing nuova password:", error);
        return res
          .status(500)
          .json({ error: "Errore di sicurezza nella gestione password" });
      }
    }

    if (newNome !== user.nome) {
      db.get(
        "SELECT id FROM utenti WHERE nome = ? AND id != ?",
        [newNome, id],
        (err2, existingUser) => {
          if (err2) {
            console.error("Errore verifica unicità nome:", err2);
            return res
              .status(500)
              .json({ error: "Errore durante la verifica nome" });
          }
          if (existingUser) {
            return res
              .status(400)
              .json({ error: "Nome già in uso da un altro utente" });
          }

          db.run(
            "UPDATE utenti SET nome = ?, password = ? WHERE id = ?",
            [newNome, newPasswordHash, id],
            function (err3) {
              if (err3) {
                console.error("Errore aggiornamento utente:", err3);
                return res
                  .status(500)
                  .json({ error: "Errore durante l'aggiornamento utente" });
              }

              const io = req.app.get("io");
              if (io) {
                io.emit("utente_modificato", { id, oldNome: user.nome, newNome });
                io.emit("utenti_aggiornati");
              }
              res.json({
                id,
                nome: newNome
              });
            }
          );
        }
      );
    } else {
      db.run(
        "UPDATE utenti SET nome = ?, password = ? WHERE id = ?",
        [newNome, newPasswordHash, id],
        function (err3) {
          if (err3) {
            console.error("Errore aggiornamento utente:", err3);
            return res
              .status(500)
              .json({ error: "Errore durante l'aggiornamento utente" });
          }

          const io = req.app.get("io");
          if (io) {
            io.emit("utente_modificato", { id, oldNome: user.nome, newNome: user.nome });
            io.emit("utenti_aggiornati");
          }
          res.json({
            id,
            nome: newNome,
            password_modificata: password ? true : false,
          });
        }
      );
    }
  });
});

// DELETE /api/utenti/:id - elimina utente
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT COUNT(*) AS total FROM utenti", [], (err, row) => {
    if (err) {
      console.error("Errore conteggio utenti:", err);
      return res.status(500).json({ error: "Errore nel conteggio utenti" });
    }

    if (row.total <= 1) {
      return res.status(400).json({
        error: "Non puoi eliminare l'unico utente rimasto",
      });
    }

    db.get("SELECT nome FROM utenti WHERE id = ?", [id], (err2, user) => {
      if (err2) {
        console.error("Errore recupero utente per eliminazione:", err2);
        return res
          .status(500)
          .json({ error: "Errore durante il recupero utente" });
      }

      if (!user) {
        return res.status(404).json({ error: "Utente non trovato" });
      }

      db.run("DELETE FROM utenti WHERE id = ?", [id], function (err3) {
        if (err3) {
          console.error("Errore eliminazione utente:", err3);
          return res
            .status(500)
            .json({ error: "Errore durante l'eliminazione utente" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: "Utente non trovato" });
        }

        const io = req.app.get("io");
        if (io) {
          io.emit("utente_eliminato", { id, nome: user.nome });
          io.emit("utenti_aggiornati");
        }

        res.json({
          success: true,
          id
        });
      });
    });
  });
});

module.exports = router;
