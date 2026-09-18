// Repository modelli
const { dbGet, dbAll, dbRun } = require("../config/database");

module.exports = {
  lista() {
    return dbAll(`
      SELECT mo.*, ma.nome as marca_nome,
             COUNT(o.id) AS preventivi_count
      FROM modelli mo
      LEFT JOIN marche ma ON mo.marche_id = ma.id
      LEFT JOIN ordini o ON o.modello_id = mo.id
      GROUP BY mo.id, mo.nome, mo.marche_id, mo.created_at, ma.nome
      ORDER BY mo.nome COLLATE NOCASE, mo.nome
    `);
  },

  trovaPerId(id) {
    return dbGet(
      `
      SELECT mo.*, ma.nome as marca_nome,
             COUNT(o.id) AS preventivi_count
      FROM modelli mo
      LEFT JOIN marche ma ON mo.marche_id = ma.id
      LEFT JOIN ordini o ON o.modello_id = mo.id
      WHERE mo.id = ?
      GROUP BY mo.id, mo.nome, mo.marche_id, mo.created_at, ma.nome
    `,
      [id],
    );
  },

  async crea(nome, marche_id) {
    const r = await dbRun(
      "INSERT INTO modelli (nome, marche_id) VALUES (?, ?)",
      [nome, marche_id],
    );
    return r.lastID;
  },

  aggiorna(id, nome, marche_id) {
    return dbRun("UPDATE modelli SET nome = ?, marche_id = ? WHERE id = ?", [
      nome,
      marche_id,
      id,
    ]);
  },

  elimina(id) {
    return dbRun("DELETE FROM modelli WHERE id = ?", [id]);
  },

  async contaOrdini(id) {
    const row = await dbGet(
      "SELECT COUNT(*) as count FROM ordini WHERE modello_id = ?",
      [id],
    );
    return row.count || 0;
  },
};
