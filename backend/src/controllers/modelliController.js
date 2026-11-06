const s = require("../services/modelliService");
module.exports = {
  async lista(req, res) { res.json(await s.lista()); },
  async dettaglio(req, res) { res.json(await s.dettaglio(req.params.id)); },
  async crea(req, res) { res.json(await s.crea(req.body)); },
  async aggiorna(req, res) { res.json(await s.aggiorna(req.params.id, req.body)); },
  async elimina(req, res) { res.json(await s.elimina(req.params.id)); },
};
