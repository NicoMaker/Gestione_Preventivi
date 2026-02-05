const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// Get all modelli with marca info
router.get('/', (req, res) => {
  const query = `
    SELECT m.*, ma.nome as marca_nome
    FROM modelli m
    LEFT JOIN marche ma ON m.marche_id = ma.id
    ORDER BY m.nome
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Errore del server' });
    }
    res.json(rows);
  });
});

// Get single modello
router.get('/:id', (req, res) => {
  const query = `
    SELECT m.*, ma.nome as marca_nome
    FROM modelli m
    LEFT JOIN marche ma ON m.marche_id = ma.id
    WHERE m.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Errore del server' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Modello non trovato' });
    }
    res.json(row);
  });
});

// Create modello
router.post('/', (req, res) => {
  const { nome, marche_id } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome richiesto' });
  }

  db.run(
    'INSERT INTO modelli (nome, marche_id) VALUES (?, ?)',
    [nome, marche_id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Modello già esistente' });
        }
        return res.status(500).json({ error: 'Errore del server' });
      }
      res.json({ id: this.lastID, nome, marche_id });
    }
  );
});

// Update modello
router.put('/:id', (req, res) => {
  const { nome, marche_id } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome richiesto' });
  }

  db.run(
    'UPDATE modelli SET nome = ?, marche_id = ? WHERE id = ?',
    [nome, marche_id, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Modello già esistente' });
        }
        return res.status(500).json({ error: 'Errore del server' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Modello non trovato' });
      }
      res.json({ id: req.params.id, nome, marche_id });
    }
  );
});

// Delete modello
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Verifica se ci sono ordini collegati
  db.get('SELECT COUNT(*) as count FROM ordini WHERE modello_id = ?', [id], (err, row) => {
    if (err) {
      console.error('Errore verifica ordini:', err);
      return res.status(500).json({ error: 'Errore del server' });
    }
    
    const ordiniCount = row.count || 0;
    
    if (ordiniCount > 0) {
      console.log(`Tentativo di eliminare modello ID ${id} con ${ordiniCount} ordini - BLOCCATO`);
      return res.status(400).json({
        error: ordiniCount === 1
          ? "Impossibile eliminare: c'è 1 ordine collegato a questo modello."
          : `Impossibile eliminare: ci sono ${ordiniCount} ordini collegati a questo modello.`,
        ordini_count: ordiniCount,
      });
    }
    
    // Nessun ordine collegato, procedi con eliminazione
    db.run('DELETE FROM modelli WHERE id = ?', [id], function(err2) {
      if (err2) {
        console.error('Errore eliminazione modello:', err2);
        return res.status(500).json({ error: 'Errore del server' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Modello non trovato' });
      }
      
      const io = req.app.get('io');
      if (io) {
        io.emit('modello_eliminato', { id });
        io.emit('modelli_aggiornati');
      }
      
      console.log(`Modello eliminato: ID ${id}`);
      res.json({ success: true, message: 'Modello eliminato con successo' });
    });
  });
});

module.exports = router;
