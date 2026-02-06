// backend/routes/ordini.js
const express = require("express");
const router = express.Router();
const { db } = require("../db/init");

// GET - Lista tutti gli ordini con info cliente
router.get("/", (req, res) => {
  const query = `
    SELECT 
      o.id,
      o.cliente_id,
      c.nome as cliente_nome,
      c.num_tel as cliente_tel,
      c.email as cliente_email,
      o.data_movimento,
      o.modello_id,
      m.nome as modello_nome,
      o.marca_id,
      ma.nome as marca_nome,
      o.note,
      o.created_at
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    LEFT JOIN modelli m ON o.modello_id = m.id
    LEFT JOIN marche ma ON o.marca_id = ma.id
    ORDER BY o.data_movimento DESC, m.nome ASC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Errore caricamento ordini:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`${rows.length} ordini caricati`);
    res.json(rows);
  });
});

// GET - Ordini per cliente specifico
router.get("/cliente/:clienteId", (req, res) => {
  const { clienteId } = req.params;

  const query = `
    SELECT 
      o.id,
      o.cliente_id,
      c.nome as cliente_nome,
      c.num_tel as cliente_tel,
      c.email as cliente_email,
      o.data_movimento,
      o.modello_id,
      m.nome as modello_nome,
      o.marca_id,
      ma.nome as marca_nome,
      o.note,
      o.created_at
    FROM ordini o
    JOIN clienti c ON o.cliente_id = c.id
    LEFT JOIN modelli m ON o.modello_id = m.id
    LEFT JOIN marche ma ON o.marca_id = ma.id
    WHERE o.cliente_id = ?
    ORDER BY o.data_movimento DESC, o.id DESC
  `;

  db.all(query, [clienteId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// POST - Crea nuovo ordine
router.post("/", (req, res) => {
  const { cliente_id, data_movimento, modello_id, marca_id, note } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ 
      error: "Cliente obbligatorio" 
    });
  }

  const dataMovimento = data_movimento || new Date().toISOString();

  db.run(
    `INSERT INTO ordini (cliente_id, data_movimento, modello_id, marca_id, note) 
     VALUES (?, ?, ?, ?, ?)`,
    [cliente_id, dataMovimento, modello_id || null, marca_id || null, note || null],
    function (err) {
      if (err) {
        console.error("Errore creazione ordine:", err);
        return res.status(500).json({ error: err.message });
      }

      const ordineId = this.lastID;

      // Recupera i dati completi dell'ordine appena creato
      db.get(
        `SELECT 
          o.id,
          o.cliente_id,
          c.nome as cliente_nome,
          c.num_tel as cliente_tel,
          c.email as cliente_email,
          o.data_movimento,
          o.modello_id,
          m.nome as modello_nome,
          o.marca_id,
          ma.nome as marca_nome,
          o.note,
          o.created_at
        FROM ordini o
        JOIN clienti c ON o.cliente_id = c.id
        LEFT JOIN modelli m ON o.modello_id = m.id
        LEFT JOIN marche ma ON o.marca_id = ma.id
        WHERE o.id = ?`,
        [ordineId],
        (err2, ordine) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          const io = req.app.get("io");
          if (io) {
            io.emit("ordine_aggiunto");
            io.emit("ordini_aggiornati");
          }

          console.log(`Ordine creato: ID ${ordineId} per cliente ${cliente_id}`);

          res.json(ordine);
        }
      );
    }
  );
});

// PUT - Aggiorna ordine
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { cliente_id, data_movimento, modello_id, marca_id, note } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ 
      error: "Cliente obbligatorio" 
    });
  }

  db.run(
    `UPDATE ordini 
     SET cliente_id = ?, data_movimento = ?, modello_id = ?, marca_id = ?, note = ? 
     WHERE id = ?`,
    [cliente_id, data_movimento, modello_id || null, marca_id || null, note || null, id],
    function (err) {
      if (err) {
        console.error("Errore aggiornamento ordine:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Ordine non trovato" });
      }

      const io = req.app.get("io");
      if (io) {
        io.emit("ordine_modificato", { id });
        io.emit("ordini_aggiornati");
      }

      console.log(`Ordine aggiornato: ID ${id}`);
      res.json({ success: true });
    }
  );
});

// DELETE - Elimina ordine
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM ordini WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Errore eliminazione ordine:", err);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Ordine non trovato" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("ordine_eliminato", { id });
      io.emit("ordini_aggiornati");
    }

    console.log(`Ordine eliminato: ID ${id}`);

    res.json({
      success: true,
      message: "Ordine eliminato con successo",
    });
  });
});

module.exports = router;