// Service ordini (preventivi): validazione + eventi
const repo = require("../repositories/ordiniRepository");
const realtime = require("../realtime/socket");
const { HttpError } = require("../middleware/errorHandler");

function normalizza(body) {
  return {
    cliente_id: body.cliente_id,
    data_movimento: body.data_movimento || new Date().toISOString(),
    modello_id: body.modello_id || null,
    marca_id: body.marca_id || null,
    note: body.note || null,
    contratto_finito: body.contratto_finito ? 1 : 0,
  };
}

module.exports = {
  lista() { return repo.lista(); },
  perCliente(clienteId) { return repo.perCliente(clienteId); },

  async crea(body) {
    if (!body.cliente_id) throw new HttpError(400, "Cliente obbligatorio");
    const id = await repo.crea(normalizza(body));
    const ordine = await repo.trovaPerId(id);
    realtime.emit("ordine_aggiunto");
    realtime.emit("ordini_aggiornati");
    return ordine;
  },

  async aggiorna(id, body) {
    if (!body.cliente_id) throw new HttpError(400, "Cliente obbligatorio");
    // data_movimento in update non ha fallback: mantiene il comportamento originale
    const dati = { ...normalizza(body), data_movimento: body.data_movimento };
    const result = await repo.aggiorna(id, dati);
    if (result.changes === 0) throw new HttpError(404, "Ordine non trovato");
    realtime.emit("ordine_modificato", { id });
    realtime.emit("ordini_aggiornati");
    return { success: true };
  },

  async elimina(id) {
    const result = await repo.elimina(id);
    if (result.changes === 0) throw new HttpError(404, "Ordine non trovato");
    realtime.emit("ordine_eliminato", { id });
    realtime.emit("ordini_aggiornati");
    return { success: true, message: "Ordine eliminato con successo" };
  },
};
