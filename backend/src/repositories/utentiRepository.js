// Repository utenti
const { dbGet, dbAll, dbRun } = require("../config/database");

module.exports = {
  lista() { return dbAll("SELECT id, nome, created_at FROM utenti ORDER BY nome COLLATE NOCASE, nome"); },
  trovaPerId(id) { return dbGet("SELECT * FROM utenti WHERE id = ?", [id]); },
  trovaPerNome(nome) { return dbGet("SELECT * FROM utenti WHERE nome = ?", [nome]); },
  async crea(nome, hashedPassword) {
    const r = await dbRun("INSERT INTO utenti (nome, password) VALUES (?, ?)", [nome, hashedPassword]);
    return r.lastID;
  },
  aggiorna(id, nome, hashedPassword) {
    return dbRun("UPDATE utenti SET nome = ?, password = ? WHERE id = ?", [nome, hashedPassword, id]);
  },
  elimina(id) { return dbRun("DELETE FROM utenti WHERE id = ?", [id]); },
  async conta() { const row = await dbGet("SELECT COUNT(*) as total FROM utenti"); return row.total; },
};
