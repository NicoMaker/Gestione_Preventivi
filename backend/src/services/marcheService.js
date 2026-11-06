// Service marche: validazione unicità, blocco eliminazione con modelli/ordini
const repo = require("../repositories/marcheRepository");
const realtime = require("../realtime/socket");
const { HttpError } = require("../middleware/errorHandler");

module.exports = {
  lista() { return repo.listaConConteggio(); },
  async dettaglio(id) {
    const marca = await repo.trovaPerId(id);
    if (!marca) throw new HttpError(404, "Marca non trovata");
    return marca;
  },
  async crea(nome) {
    if (!nome) throw new HttpError(400, "Nome richiesto");
    let id;
    try { id = await repo.crea(nome); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(409, "Marca già esistente");
      throw new HttpError(500, "Errore del server");
    }
    realtime.emit("marca_aggiunta");
    realtime.emit("marche_aggiornate");
    return { id, nome };
  },
  async aggiorna(id, nome) {
    if (!nome) throw new HttpError(400, "Nome richiesto");
    let result;
    try { result = await repo.aggiorna(id, nome); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(409, "Marca già esistente");
      throw new HttpError(500, "Errore del server");
    }
    if (result.changes === 0) throw new HttpError(404, "Marca non trovata");
    realtime.emit("marca_modificata", { id });
    realtime.emit("marche_aggiornate");
    return { id, nome };
  },
  async elimina(id) {
    const modelliCount = await repo.contaModelli(id);
    if (modelliCount > 0) {
      throw new HttpError(400,
        modelliCount === 1
          ? "Impossibile eliminare: c'è 1 modello collegato a questa marca."
          : `Impossibile eliminare: ci sono ${modelliCount} modelli collegati a questa marca.`,
        { modelli_count: modelliCount });
    }
    const ordiniCount = await repo.contaOrdini(id);
    if (ordiniCount > 0) {
      throw new HttpError(400,
        ordiniCount === 1
          ? "Impossibile eliminare: c'è 1 ordine collegato a questa marca."
          : `Impossibile eliminare: ci sono ${ordiniCount} ordini collegati a questa marca.`,
        { ordini_count: ordiniCount });
    }
    const result = await repo.elimina(id);
    if (result.changes === 0) throw new HttpError(404, "Marca non trovata");
    realtime.emit("marca_eliminata", { id });
    realtime.emit("marche_aggiornate");
    return { success: true, message: "Marca eliminata con successo" };
  },
};
