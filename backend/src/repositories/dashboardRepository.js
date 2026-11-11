// Repository dashboard: sole query di lettura aggregata (nessuna scrittura)
const { dbGet, dbAll } = require("../config/database");

const cont = async (sql, params = []) => (await dbGet(sql, params)).n || 0;

module.exports = {
  conteggi() {
    return Promise.all([
      cont("SELECT COUNT(*) AS n FROM clienti"),
      cont("SELECT COUNT(*) AS n FROM ordini"),
      cont("SELECT COUNT(*) AS n FROM ordini WHERE contratto_finito = 1"),
      cont(
        "SELECT COUNT(*) AS n FROM clienti WHERE COALESCE(flag_ricontatto, 0) = 0",
      ),
      cont("SELECT COUNT(*) AS n FROM marche"),
      cont("SELECT COUNT(*) AS n FROM modelli"),
      cont("SELECT COUNT(*) AS n FROM utenti"),
      cont(
        "SELECT COUNT(*) AS n FROM ordini WHERE date(data_movimento) >= date('now', 'localtime', '-30 day')",
      ),
    ]).then(
      ([
        clienti,
        preventivi,
        conclusi,
        daRicontattare,
        marche,
        modelli,
        utenti,
        ultimi30,
      ]) => ({
        clienti,
        preventivi,
        preventivi_conclusi: conclusi,
        preventivi_aperti: preventivi - conclusi,
        da_ricontattare: daRicontattare,
        marche,
        modelli,
        utenti,
        preventivi_30gg: ultimi30,
      }),
    );
  },

  // Da ricontattare con data di ricontatto oggi o già passata
  ricontattiScaduti() {
    return dbAll(
      `SELECT id, nome FROM clienti
       WHERE COALESCE(flag_ricontatto, 0) = 0
         AND data_passaggio IS NOT NULL AND data_passaggio <> ''
         AND date(data_passaggio) <= date('now', 'localtime')
       ORDER BY data_passaggio ASC, nome COLLATE NOCASE`,
    );
  },

  // Da ricontattare con data nei prossimi 7 giorni
  ricontattiProssimi() {
    return dbAll(
      `SELECT id, nome FROM clienti
       WHERE COALESCE(flag_ricontatto, 0) = 0
         AND data_passaggio IS NOT NULL AND data_passaggio <> ''
         AND date(data_passaggio) > date('now', 'localtime')
         AND date(data_passaggio) <= date('now', 'localtime', '+7 day')
       ORDER BY data_passaggio ASC, nome COLLATE NOCASE`,
    );
  },

  // Preventivi non conclusi da più di `giorni` giorni
  preventiviAperti(giorni) {
    return dbAll(
      `SELECT o.id, c.nome || COALESCE(' · ' || m.nome, '') AS nome
       FROM ordini o
       JOIN clienti c ON c.id = o.cliente_id
       LEFT JOIN modelli m ON m.id = o.modello_id
       WHERE COALESCE(o.contratto_finito, 0) = 0
         AND date(o.data_movimento) <= date('now', 'localtime', ?)
       ORDER BY o.data_movimento ASC`,
      [`-${giorni} day`],
    );
  },

  clientiSenzaRecapiti() {
    return dbAll(
      `SELECT id, nome FROM clienti
       WHERE COALESCE(TRIM(num_tel), '') = '' AND COALESCE(TRIM(email), '') = ''
       ORDER BY nome COLLATE NOCASE`,
    );
  },

  clientiSenzaPreventivi() {
    return dbAll(
      `SELECT c.id, c.nome FROM clienti c
       WHERE NOT EXISTS (SELECT 1 FROM ordini o WHERE o.cliente_id = c.id)
       ORDER BY c.nome COLLATE NOCASE`,
    );
  },

  marcheInutilizzate() {
    return dbAll(
      `SELECT ma.id, ma.nome FROM marche ma
       WHERE NOT EXISTS (SELECT 1 FROM modelli mo WHERE mo.marche_id = ma.id)
         AND NOT EXISTS (SELECT 1 FROM ordini o WHERE o.marca_id = ma.id)
       ORDER BY ma.nome COLLATE NOCASE`,
    );
  },

  modelliInutilizzati() {
    return dbAll(
      `SELECT mo.id, mo.nome FROM modelli mo
       WHERE NOT EXISTS (SELECT 1 FROM ordini o WHERE o.modello_id = mo.id)
       ORDER BY mo.nome COLLATE NOCASE`,
    );
  },

  andamentoMensile(dataInizio) {
    return dbAll(
      `SELECT substr(data_movimento, 1, 7) AS mese,
              COUNT(*) AS creati,
              SUM(CASE WHEN contratto_finito = 1 THEN 1 ELSE 0 END) AS conclusi
       FROM ordini WHERE date(data_movimento) >= date(?)
       GROUP BY mese`,
      [dataInizio],
    );
  },

  topMarche(limite) {
    return dbAll(
      `SELECT ma.id, ma.nome, COUNT(o.id) AS preventivi
       FROM marche ma JOIN ordini o ON o.marca_id = ma.id
       GROUP BY ma.id, ma.nome
       ORDER BY preventivi DESC, ma.nome COLLATE NOCASE LIMIT ?`,
      [limite],
    );
  },

  ultimiPreventivi(limite) {
    return dbAll(
      `SELECT o.id, o.data_movimento, o.contratto_finito,
              c.nome AS cliente_nome, m.nome AS modello_nome, ma.nome AS marca_nome
       FROM ordini o
       JOIN clienti c ON c.id = o.cliente_id
       LEFT JOIN modelli m ON m.id = o.modello_id
       LEFT JOIN marche ma ON ma.id = o.marca_id
       ORDER BY o.data_movimento DESC, o.id DESC LIMIT ?`,
      [limite],
    );
  },
};
