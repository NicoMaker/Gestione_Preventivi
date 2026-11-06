// Service modelli: validazione, blocco eliminazione con ordini
const repo = require("../repositories/modelliRepository");
const realtime = require("../realtime/socket");
const { HttpError } = require("../middleware/errorHandler");

module.exports = {
  lista() { return repo.lista(); },
  async dettaglio(id) {
    const modello = await repo.trovaPerId(id);
    if (!modello) throw new HttpError(404, "Modello non trovato");
    return modello;
  },
  async crea({ nome, marche_id }) {
    if (!nome) throw new HttpError(400, "Nome richiesto");
    let id;
    try { id = await repo.crea(nome, marche_id || null); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(409, "Modello già esistente");
      throw new HttpError(500, "Errore del server");
    }
    realtime.emit("modello_aggiunto");
    realtime.emit("modelli_aggiornati");
    return { id, nome, marche_id: marche_id || null };
  },
  async aggiorna(id, { nome, marche_id }) {
    if (!nome) throw new HttpError(400, "Nome richiesto");
    let result;
    try { result = await repo.aggiorna(id, nome, marche_id || null); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(409, "Modello già esistente");
      throw new HttpError(500, "Errore del server");
    }
    if (result.changes === 0) throw new HttpError(404, "Modello non trovato");
    realtime.emit("modello_modificato", { id });
    realtime.emit("modelli_aggiornati");
    return { id, nome, marche_id: marche_id || null };
  },
  async elimina(id) {
    const ordiniCount = await repo.contaOrdini(id);
    if (ordiniCount > 0) {
      throw new HttpError(400,
        ordiniCount === 1
          ? "Impossibile eliminare: c'è 1 ordine collegato a questo modello."
          : `Impossibile eliminare: ci sono ${ordiniCount} ordini collegati a questo modello.`,
        { ordini_count: ordiniCount });
    }
    const result = await repo.elimina(id);
    if (result.changes === 0) throw new HttpError(404, "Modello non trovato");
    realtime.emit("modello_eliminato", { id });
    realtime.emit("modelli_aggiornati");
    return { success: true, message: "Modello eliminato con successo" };
  },
};
