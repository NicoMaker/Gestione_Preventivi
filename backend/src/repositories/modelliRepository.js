// Repository modelli
const { dbGet, dbAll, dbRun } = require("../config/database");

module.exports = {
  lista() {
    return dbAll(`
      SELECT mo.*, ma.nome as marca_nome
      FROM modelli mo LEFT JOIN marche ma ON mo.marche_id = ma.id
      ORDER BY mo.nome COLLATE NOCASE, mo.nome
    `);
  },
  trovaPerId(id) {
    return dbGet(`SELECT mo.*, ma.nome as marca_nome FROM modelli mo LEFT JOIN marche ma ON mo.marche_id = ma.id WHERE mo.id = ?`, [id]);
  },
  async crea(nome, marche_id) {
    const r = await dbRun("INSERT INTO modelli (nome, marche_id) VALUES (?, ?)", [nome, marche_id]);
    return r.lastID;
  },
  aggiorna(id, nome, marche_id) {
    return dbRun("UPDATE modelli SET nome = ?, marche_id = ? WHERE id = ?", [nome, marche_id, id]);
  },
  elimina(id) { return dbRun("DELETE FROM modelli WHERE id = ?", [id]); },
  async contaOrdini(id) {
    const row = await dbGet("SELECT COUNT(*) as count FROM ordini WHERE modello_id = ?", [id]);
    return row.count || 0;
  },
};
