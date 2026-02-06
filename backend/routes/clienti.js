// backend/routes/clienti.js
const express = require("express");
const router = express.Router();
const { db } = require("../db/init");

// GET - Lista tutti i clienti con conteggio ordini
router.get("/", (req, res) => {
  const query = `
    SELECT 
      c.id, 
      c.nome, 
      c.num_tel,
      c.email,
      c.data_passaggio,
      c.flag_ricontatto,
      c.created_at,
      COUNT(o.id) as ordini_count
    FROM clienti c
    LEFT JOIN ordini o ON c.id = o.cliente_id
    GROUP BY c.id, c.nome, c.num_tel, c.email, c.data_passaggio, c.flag_ricontatto, c.created_at
    ORDER BY c.nome ASC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Errore caricamento clienti:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`${rows.length} clienti caricati con conteggio ordini`);
    res.json(rows);
  });
});

// GET - Dettaglio cliente con storico ordini
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM clienti WHERE id = ?", [id], (err, cliente) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!cliente) {
      return res.status(404).json({ error: "Cliente non trovato" });
    }

    // Recupera gli ordini del cliente
    db.all(
      `SELECT * FROM ordini WHERE cliente_id = ? ORDER BY data_movimento DESC`,
      [id],
      (err2, ordini) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        res.json({
          ...cliente,
          ordini: ordini,
        });
      }
    );
  });
});

// POST - Crea nuovo cliente
router.post("/", (req, res) => {
  const { nome, num_tel, email, data_passaggio, flag_ricontatto } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: "Nome cliente obbligatorio" });
  }

  db.run(
    "INSERT INTO clienti (nome, num_tel, email, data_passaggio, flag_ricontatto) VALUES (?, ?, ?, ?, ?)",
    [
      nome.trim(), 
      num_tel || null, 
      email || null, 
      data_passaggio || null,
      flag_ricontatto ? 1 : 0
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Cliente già esistente" });
        }
        console.error("Errore creazione cliente:", err);
        return res.status(500).json({ error: err.message });
      }

      const io = req.app.get("io");
      if (io) {
        io.emit("cliente_aggiunto");
        io.emit("clienti_aggiornati");
      }

      console.log(`Cliente creato: "${nome.trim()}" (ID: ${this.lastID})`);

      res.json({
        id: this.lastID,
        nome: nome.trim(),
        num_tel: num_tel || null,
        email: email || null,
        data_passaggio: data_passaggio || null,
        flag_ricontatto: flag_ricontatto ? 1 : 0,
        ordini_count: 0,
      });
    }
  );
});

// PUT - Aggiorna cliente
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, num_tel, email, data_passaggio, flag_ricontatto } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: "Nome cliente obbligatorio" });
  }

  db.run(
    "UPDATE clienti SET nome = ?, num_tel = ?, email = ?, data_passaggio = ?, flag_ricontatto = ? WHERE id = ?",
    [
      nome.trim(), 
      num_tel || null, 
      email || null, 
      data_passaggio || null,
      flag_ricontatto ? 1 : 0,
      id
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Cliente già esistente" });
        }
        console.error("Errore aggiornamento cliente:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Cliente non trovato" });
      }

      const io = req.app.get("io");
      if (io) {
        io.emit("cliente_modificato", { id });
        io.emit("clienti_aggiornati");
      }

      console.log(`Cliente aggiornato: ID ${id} -> "${nome.trim()}"`);
      res.json({ success: true, nome: nome.trim() });
    }
  );
});

// DELETE - Elimina cliente
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Conta gli ordini collegati a questo cliente
  db.get(
    "SELECT COUNT(*) as count FROM ordini WHERE cliente_id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("Errore verifica ordini:", err);
        return res.status(500).json({ error: err.message });
      }

      const ordiniCount = row.count || 0;

      // Blocca l'eliminazione se ci sono ordini
      if (ordiniCount > 0) {
        console.log(`Tentativo di eliminare cliente ID ${id} con ${ordiniCount} ordini - BLOCCATO`);
        
        return res.status(400).json({
          error: ordiniCount === 1
            ? "Impossibile eliminare: c'è 1 preventivo collegato a questo cliente."
            : `Impossibile eliminare: ci sono ${ordiniCount} preventivi collegati a questo cliente.`,
          ordini_count: ordiniCount,
        });
      }

      // Nessun ordine collegato, procedi con l'eliminazione
      db.run("DELETE FROM clienti WHERE id = ?", [id], function (err2) {
        if (err2) {
          console.error("Errore eliminazione cliente:", err2);
          return res.status(500).json({ error: err2.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: "Cliente non trovato" });
        }

        const io = req.app.get("io");
        if (io) {
          io.emit("cliente_eliminato", { id });
          io.emit("clienti_aggiornati");
        }

        console.log(`Cliente eliminato: ID ${id}`);

        res.json({
          success: true,
          message: "Cliente eliminato con successo",
        });
      });
    }
  );
});

module.exports = router;