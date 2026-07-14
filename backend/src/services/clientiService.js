// Service clienti: validazione, blocco eliminazione con preventivi, eventi
const repo = require("../repositories/clientiRepository");
const realtime = require("../realtime/socket");
const { HttpError } = require("../middleware/errorHandler");

module.exports = {
  lista() { return repo.listaConConteggio(); },

  async dettaglio(id) {
    const cliente = await repo.trovaPerId(id);
    if (!cliente) throw new HttpError(404, "Cliente non trovato");
    const ordini = await repo.ordiniDelCliente(id);
    return { ...cliente, ordini };
  },

  async crea(body) {
    if (!body.nome || !body.nome.trim()) throw new HttpError(400, "Nome cliente obbligatorio");
    const dati = {
      nome: body.nome.trim(),
      num_tel: body.num_tel || null,
      email: body.email || null,
      data_passaggio: body.data_passaggio || null,
      flag_ricontatto: body.flag_ricontatto ? 1 : 0,
      note: body.note || null,
    };
    let result;
    try { result = await repo.crea(dati); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(400, "Cliente già esistente");
      throw err;
    }
    realtime.emit("cliente_aggiunto");
    realtime.emit("clienti_aggiornati");
    return { id: result.lastID, ...dati, ordini_count: 0 };
  },

  async aggiorna(id, body) {
    const cliente = await repo.trovaPerId(id);
    if (!cliente) throw new HttpError(404, "Cliente non trovato");
    if (body.nome !== undefined && (!body.nome || !body.nome.trim()))
      throw new HttpError(400, "Nome cliente obbligatorio");

    const dati = {
      nome: body.nome !== undefined ? body.nome.trim() : cliente.nome,
      num_tel: body.num_tel !== undefined ? body.num_tel || null : cliente.num_tel,
      email: body.email !== undefined ? body.email || null : cliente.email,
      data_passaggio: body.data_passaggio !== undefined ? body.data_passaggio || null : cliente.data_passaggio,
      flag_ricontatto: body.flag_ricontatto !== undefined ? (body.flag_ricontatto ? 1 : 0) : cliente.flag_ricontatto,
      note: body.note !== undefined ? body.note || null : cliente.note,
    };
    let result;
    try { result = await repo.aggiorna(id, dati); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(400, "Cliente già esistente");
      throw err;
    }
    if (result.changes === 0) throw new HttpError(404, "Cliente non trovato");
    realtime.emit("cliente_modificato", { id });
    realtime.emit("clienti_aggiornati");
    return { success: true, nome: dati.nome };
  },

  async elimina(id) {
    const ordiniCount = await repo.contaOrdini(id);
    if (ordiniCount > 0) {
      throw new HttpError(400,
        ordiniCount === 1
          ? "Impossibile eliminare: c'è 1 preventivo collegato a questo cliente."
          : `Impossibile eliminare: ci sono ${ordiniCount} preventivi collegati a questo cliente.`,
        { ordini_count: ordiniCount });
    }
    const result = await repo.elimina(id);
    if (result.changes === 0) throw new HttpError(404, "Cliente non trovato");
    realtime.emit("cliente_eliminato", { id });
    realtime.emit("clienti_aggiornati");
    return { success: true, message: "Cliente eliminato con successo" };
  },
};
