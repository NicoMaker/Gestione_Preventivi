// Repository clienti
const { dbGet, dbAll, dbRun } = require("../config/database");

module.exports = {
  listaConConteggio() {
    return dbAll(`
      SELECT c.id, c.nome, c.num_tel, c.email, c.data_passaggio,
             c.flag_ricontatto, c.note, c.created_at,
             COUNT(o.id) as ordini_count
      FROM clienti c
      LEFT JOIN ordini o ON c.id = o.cliente_id
      GROUP BY c.id, c.nome, c.num_tel, c.email, c.data_passaggio, c.flag_ricontatto, c.note, c.created_at
      ORDER BY c.nome COLLATE NOCASE, c.nome
    `);
  },
  trovaPerId(id) { return dbGet("SELECT * FROM clienti WHERE id = ?", [id]); },
  ordiniDelCliente(id) {
    return dbAll("SELECT * FROM ordini WHERE cliente_id = ? ORDER BY data_movimento DESC", [id]);
  },
  crea(c) {
    return dbRun(
      "INSERT INTO clienti (nome, num_tel, email, data_passaggio, flag_ricontatto, note) VALUES (?, ?, ?, ?, ?, ?)",
      [c.nome, c.num_tel, c.email, c.data_passaggio, c.flag_ricontatto, c.note],
    );
  },
  aggiorna(id, c) {
    return dbRun(
      "UPDATE clienti SET nome = ?, num_tel = ?, email = ?, data_passaggio = ?, flag_ricontatto = ?, note = ? WHERE id = ?",
      [c.nome, c.num_tel, c.email, c.data_passaggio, c.flag_ricontatto, c.note, id],
    );
  },
  elimina(id) { return dbRun("DELETE FROM clienti WHERE id = ?", [id]); },
  async contaOrdini(id) {
    const row = await dbGet("SELECT COUNT(*) as count FROM ordini WHERE cliente_id = ?", [id]);
    return row.count || 0;
  },
};
