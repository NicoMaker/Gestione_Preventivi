// Repository marche
const { dbGet, dbAll, dbRun } = require("../config/database");

module.exports = {
  listaConConteggio() {
    return dbAll(`
      SELECT ma.*, COUNT(DISTINCT mo.id) AS prodotti_count, COUNT(DISTINCT o.id) AS preventivi_count
      FROM marche ma
      LEFT JOIN modelli mo ON mo.marche_id = ma.id
      LEFT JOIN ordini o ON o.marca_id = ma.id
      GROUP BY ma.id, ma.nome, ma.created_at
      ORDER BY ma.nome COLLATE NOCASE, ma.nome
    `);
  },
  trovaPerId(id) { return dbGet("SELECT * FROM marche WHERE id = ?", [id]); },
  async crea(nome) { const r = await dbRun("INSERT INTO marche (nome) VALUES (?)", [nome]); return r.lastID; },
  aggiorna(id, nome) { return dbRun("UPDATE marche SET nome = ? WHERE id = ?", [nome, id]); },
  elimina(id) { return dbRun("DELETE FROM marche WHERE id = ?", [id]); },
  async contaModelli(id) {
    const row = await dbGet("SELECT COUNT(*) as count FROM modelli WHERE marche_id = ?", [id]);
    return row.count || 0;
  },
  async contaOrdini(id) {
    const row = await dbGet("SELECT COUNT(*) as count FROM ordini WHERE marca_id = ?", [id]);
    return row.count || 0;
  },
};
