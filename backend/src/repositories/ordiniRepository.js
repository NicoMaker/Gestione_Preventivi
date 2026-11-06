// Repository ordini (preventivi)
const { dbGet, dbAll, dbRun } = require("../config/database");

const SELECT_FULL = `
  SELECT o.id, o.cliente_id,
    c.nome as cliente_nome, c.num_tel as cliente_tel, c.email as cliente_email,
    c.data_passaggio as cliente_data_passaggio, c.flag_ricontatto as cliente_flag_ricontatto,
    c.note as cliente_note,
    o.data_movimento, o.modello_id, m.nome as modello_nome,
    o.marca_id, ma.nome as marca_nome, o.note, o.contratto_finito, o.created_at
  FROM ordini o
  JOIN clienti c ON o.cliente_id = c.id
  LEFT JOIN modelli m ON o.modello_id = m.id
  LEFT JOIN marche ma ON o.marca_id = ma.id
`;

module.exports = {
  lista() {
    return dbAll(SELECT_FULL + " ORDER BY o.data_movimento DESC, m.nome COLLATE NOCASE, m.nome");
  },
  perCliente(clienteId) {
    return dbAll(SELECT_FULL + " WHERE o.cliente_id = ? ORDER BY o.data_movimento DESC, o.id DESC", [clienteId]);
  },
  trovaPerId(id) { return dbGet(SELECT_FULL + " WHERE o.id = ?", [id]); },
  async crea(o) {
    const r = await dbRun(
      "INSERT INTO ordini (cliente_id, data_movimento, modello_id, marca_id, note, contratto_finito) VALUES (?, ?, ?, ?, ?, ?)",
      [o.cliente_id, o.data_movimento, o.modello_id, o.marca_id, o.note, o.contratto_finito],
    );
    return r.lastID;
  },
  aggiorna(id, o) {
    return dbRun(
      "UPDATE ordini SET cliente_id = ?, data_movimento = ?, modello_id = ?, marca_id = ?, note = ?, contratto_finito = ? WHERE id = ?",
      [o.cliente_id, o.data_movimento, o.modello_id, o.marca_id, o.note, o.contratto_finito, id],
    );
  },
  elimina(id) { return dbRun("DELETE FROM ordini WHERE id = ?", [id]); },
};
