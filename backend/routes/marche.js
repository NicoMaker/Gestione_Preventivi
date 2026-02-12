const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// Get all marche with conteggio modelli (prodotti relazionati)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      ma.*,
      COUNT(DISTINCT mo.id) AS prodotti_count
    FROM marche ma
    LEFT JOIN modelli mo ON mo.marche_id = ma.id
    GROUP BY ma.id, ma.nome, ma.created_at
    ORDER BY ma.nome COLLATE NOCASE, ma.nome
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Errore caricamento marche:', err);
      return res.status(500).json({ error: 'Errore del server' });
    }
    res.json(rows);
  });
});

// Get single marca
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM marche WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Errore del server' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Marca non trovata' });
    }
    res.json(row);
  });
});

// Create marca
router.post('/', (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome richiesto' });
  }

  db.run('INSERT INTO marche (nome) VALUES (?)', [nome], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Marca già esistente' });
      }
      return res.status(500).json({ error: 'Errore del server' });
    }
    res.json({ id: this.lastID, nome });
  });
});

// Update marca
router.put('/:id', (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome richiesto' });
  }

  db.run(
    'UPDATE marche SET nome = ? WHERE id = ?',
    [nome, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Marca già esistente' });
        }
        return res.status(500).json({ error: 'Errore del server' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Marca non trovata' });
      }
      res.json({ id: req.params.id, nome });
    }
  );
});

// Delete marca
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Verifica se ci sono modelli collegati
  db.get('SELECT COUNT(*) as count FROM modelli WHERE marche_id = ?', [id], (err, row) => {
    if (err) {
      console.error('Errore verifica modelli:', err);
      return res.status(500).json({ error: 'Errore del server' });
    }
    
    const modelliCount = row.count || 0;
    
    if (modelliCount > 0) {
      console.log(`Tentativo di eliminare marca ID ${id} con ${modelliCount} modelli - BLOCCATO`);
      return res.status(400).json({
        error: modelliCount === 1
          ? "Impossibile eliminare: c'è 1 modello collegato a questa marca."
          : `Impossibile eliminare: ci sono ${modelliCount} modelli collegati a questa marca.`,
        modelli_count: modelliCount,
      });
    }
    
    // Verifica se ci sono ordini collegati
    db.get('SELECT COUNT(*) as count FROM ordini WHERE marca_id = ?', [id], (err2, row2) => {
      if (err2) {
        console.error('Errore verifica ordini:', err2);
        return res.status(500).json({ error: 'Errore del server' });
      }
      
      const ordiniCount = row2.count || 0;
      
      if (ordiniCount > 0) {
        console.log(`Tentativo di eliminare marca ID ${id} con ${ordiniCount} ordini - BLOCCATO`);
        return res.status(400).json({
          error: ordiniCount === 1
            ? "Impossibile eliminare: c'è 1 ordine collegato a questa marca."
            : `Impossibile eliminare: ci sono ${ordiniCount} ordini collegati a questa marca.`,
          ordini_count: ordiniCount,
        });
      }
      
      // Nessun collegamento, procedi con eliminazione
      db.run('DELETE FROM marche WHERE id = ?', [id], function(err3) {
        if (err3) {
          console.error('Errore eliminazione marca:', err3);
          return res.status(500).json({ error: 'Errore del server' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Marca non trovata' });
        }
        
        const io = req.app.get('io');
        if (io) {
          io.emit('marca_eliminata', { id });
          io.emit('marche_aggiornate');
        }
        
        console.log(`Marca eliminata: ID ${id}`);
        res.json({ success: true, message: 'Marca eliminata con successo' });
      });
    });
  });
});

module.exports = router;